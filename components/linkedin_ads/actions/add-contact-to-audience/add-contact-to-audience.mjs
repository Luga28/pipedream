import linkedinAds from "../../linkedin_ads.app.mjs";
import { axios } from "@pipedream/platform";

export default {
  key: "linkedin_ads-add-contact-to-audience",
  name: "Add Contact to an Audience",
  description: "Adds a specific contact to an existing audience on LinkedIn Ads. [See the documentation](https://learn.microsoft.com/en-us/linkedin/marketing/usecases/matched-audiences/workflows/streaming?view=li-lms-2024-01)",
  version: "0.0.{{ts}}",
  type: "action",
  props: {
    linkedinAds,
    audienceId: {
      propDefinition: [
        linkedinAds,
        "audienceId",
      ],
    },
    contactId: {
      propDefinition: [
        linkedinAds,
        "contactId",
      ],
    },
  },
  async run({ $ }) {
    const response = await this.linkedinAds.addToAudience({
      audienceId: this.audienceId,
      contactId: this.contactId,
    });

    $.export("$summary", `Successfully added contact ${this.contactId} to audience ${this.audienceId}`);
    return response;
  },
};
