import unittest
from unittest.mock import patch
from types import SimpleNamespace
from dify_plugin.entities.tool import ToolRuntime
from tools.scrape import ScrapeTool
from tools.crawl import CrawlTool
from tools.crawl_status import CrawlStatusTool
from provider.fetchrelay import FetchRelayProvider
from client import call


def tool(cls):
    return cls(runtime=ToolRuntime(user_id="qa", session_id="qa", credentials={"api_key": "fr_testonly"}), session=SimpleNamespace())


class ToolTests(unittest.TestCase):
    def test_scrape_keeps_warnings_and_rejects_empty(self):
        with patch('tools.scrape.call', return_value={"success": True, "data": {"markdown": "# Example"}, "diagnostics": {"warnings": ["Partial"]}}):
            messages = list(tool(ScrapeTool)._invoke({"url": "https://example.com"}))
            self.assertEqual(len(messages), 2)
            self.assertIn('Partial', str(messages[0]))
        with patch('tools.scrape.call', return_value={"success": True, "data": {"markdown": ""}}):
            with self.assertRaises(ValueError):
                list(tool(ScrapeTool)._invoke({"url": "https://example.com"}))

    def test_crawl_is_bounded_and_async(self):
        with patch('tools.crawl.call', return_value={"success": True, "data": {"id": "job"}}) as request:
            list(tool(CrawlTool)._invoke({"url": "https://example.com"}))
            body = request.call_args.args[2]
            self.assertEqual(body['limit'], 10)
            self.assertTrue(body['async'])

    def test_status_rejects_paths(self):
        with patch('tools.crawl_status.call') as request:
            with self.assertRaises(ValueError):
                list(tool(CrawlStatusTool)._invoke({"job_id": "../account"}))
            request.assert_not_called()

    def test_account_errors_are_safe_and_no_redirects(self):
        for status in (401, 402, 403, 429, 502):
            with patch('client.httpx.request', return_value=SimpleNamespace(status_code=status)) as request:
                with self.assertRaisesRegex(ValueError, str(status)):
                    call('fr_testonly', '/scrape', {"url": "https://example.com"})
                self.assertFalse(request.call_args.kwargs['follow_redirects'])
                self.assertEqual(request.call_args.args[1], 'https://fetchrelay.com/api/scrape')

    def test_validation_does_not_scrape(self):
        with patch('provider.fetchrelay.call', return_value={"success": True, "user": {"id": "fixture"}}) as request:
            FetchRelayProvider()._validate_credentials({"api_key": "fr_testonly"})
            self.assertEqual(request.call_args.args[1], '/account')


if __name__ == '__main__':
    unittest.main()
