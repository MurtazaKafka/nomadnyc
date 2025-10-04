import type { ContextResource, EmailContent } from "../types";

export class ContextFetcher {
  constructor(private readonly maxResults = 2) {}

  async fetch(email: EmailContent): Promise<ContextResource[]> {
    const syntheticInsights: ContextResource[] = [];

    if (email.subject.match(/investor/i)) {
      syntheticInsights.push({
        title: "Last investor update",
        summary: "Sent quarterly metrics two weeks ago. Investor asked about expansion plans.",
        url: "https://airia.example.com/doc/investor-update",
      });
    }

    if (email.bodyText.match(/contract|agreement/i)) {
      syntheticInsights.push({
        title: "Pending contract notes",
        summary: "Legal flagged clause 4.2 for review. Waiting on redlines from partner.",
      });
    }

    return syntheticInsights.slice(0, this.maxResults);
  }
}
