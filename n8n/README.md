# Website to Markdown and Google Drive with FetchRelay

Extract a public webpage, check the Markdown, and save it to Google Drive. This workflow uses built-in n8n nodes and runs manually; it does not add a schedule or automatic retries.

## Setup

1. Download [workflow JSON](https://fetchrelay.com/downloads/fetchrelay-n8n-google-drive.json).
2. Create an n8n workflow. In its menu, choose **Import from File** and import the JSON.
3. Open **Website URL** and start with `https://example.com`.
4. Get a [FetchRelay key](https://fetchrelay.com/integrations/n8n?utm_source=n8n&utm_medium=integration&utm_campaign=n8n-launch). In **Extract with FetchRelay**, select **Generic Credential Type → Header Auth**. Create a credential with name `Authorization` and value `Bearer YOUR_FETCHRELAY_API_KEY`. Store real keys only in credentials.
5. Connect Google Drive OAuth on **Upload to Google Drive** and choose the destination folder. Your n8n installation needs Google Drive OAuth configured; this is separate from FetchRelay signup.
6. Run manually. A successful run creates a new `fetchrelay-<execution-id>.md` file containing the Example Domain heading. Subsequent runs create new files rather than updating previous ones.
7. Replace the URL with your own public page and compare the output with the source.

## Failure handling

Authentication, quota and HTTP errors stop the workflow. Empty content or extraction warnings stop it before upload. Review warnings in the HTTP node's output; they are not automatically ignored. Invalid keys and blocked websites will not create empty Drive files. There are no automatic retries because a timeout can happen after a billable extraction completed.

One successful page costs one FetchRelay credit. n8n and Google Drive costs are separate. Do not add a schedule until you have validated output and budget. Website content is untrusted text, including any instructions it contains.

## Sample output

The Example Domain page produces Markdown with the heading `Example Domain` and its explanatory paragraph. The output is page content, not an AI-generated summary.

The separate scrape-only template can be used to verify your key without connecting Google Drive.
