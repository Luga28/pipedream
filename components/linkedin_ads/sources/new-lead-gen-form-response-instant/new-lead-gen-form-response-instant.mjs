import { axios } from "@pipedream/platform";
import linkedinAds from "../../linkedin_ads.app.mjs";

export default {
  key: "linkedin_ads-new-lead-gen-form-response-instant",
  name: "New Lead Gen Form Response (Instant)",
  description: "Emit new event instantly when a new response on the lead generation form is received. [See the documentation](https://learn.microsoft.com/en-us/linkedin/marketing/lead-sync/leadsync?view=li-lms-2024-01&tabs=http)",
  version: "0.0.{{ts}}",
  type: "source",
  dedupe: "unique",
  props: {
    linkedinAds,
    db: "$.service.db",
    http: {
      type: "$.interface.http",
      customResponse: true,
    },
    leadGenFormId: {
      propDefinition: [
        linkedinAds,
        "leadGenFormId",
      ],
    },
  },
  hooks: {
    async deploy() {
      const responses = await this.linkedinAds.getLeadGenFormResponses({
        formId: this.leadGenFormId,
        count: 50,
      });

      responses.reverse().forEach((response) => {
        this.$emit(response, {
          id: response.id,
          summary: `New response from ${response.formName}`,
          ts: Date.parse(response.submittedAt),
        });
      });
    },
    async activate() {
      const { data } = await this.linkedinAds.createWebhookSubscription({
        formId: this.leadGenFormId,
        eventTypes: [
          "LEAD_ACTION",
        ],
      });

      this.db.set("subscriptionId", data.subscriptionId);
    },
    async deactivate() {
      const subscriptionId = this.db.get("subscriptionId");
      await this.linkedinAds.deleteWebhookSubscription(subscriptionId);
    },
  },
  async run(event) {
    const {
      body, headers,
    } = event;
    const signature = headers["x-linkedin-signature"];
    const computedSignature = this.linkedinAds.generateSignature(body);

    if (signature !== computedSignature) {
      this.http.respond({
        status: 401,
        body: "Unauthorized",
      });
      return;
    }

    const lead = JSON.parse(body);
    if (lead.type === "LEAD_ACTION" && lead.leadGenFormResponse) {
      this.$emit(lead, {
        id: lead.leadGenFormResponse,
        summary: `New lead gen form response: ${lead.leadGenFormResponse}`,
        ts: lead.occurredAt
          ? Date.parse(lead.occurredAt)
          : new Date().getTime(),
      });
    }

    this.http.respond({
      status: 200,
      body: {
        received: true,
      },
    });
  },
};
