import { axios } from "@pipedream/platform";
import linkedinAds from "../../linkedin_ads.app.mjs";

export default {
  key: "linkedin_ads-send-conversion-event",
  name: "Send Conversion Event",
  description: "Sends a conversion event to LinkedIn Ads. [See the documentation](https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads-reporting/conversions-api)",
  version: "0.0.{{ts}}",
  type: "action",
  props: {
    linkedinAds,
    conversionId: {
      propDefinition: [
        linkedinAds,
        "conversionId",
      ],
    },
    conversionValue: {
      propDefinition: [
        linkedinAds,
        "conversionValue",
        (c) => ({
          optional: true,
        }),
      ],
    },
    associatedContactId: {
      propDefinition: [
        linkedinAds,
        "associatedContactId",
        (c) => ({
          optional: true,
        }),
      ],
    },
    timestamp: {
      propDefinition: [
        linkedinAds,
        "timestamp",
        (c) => ({
          optional: true,
        }),
      ],
    },
  },
  async run({ $ }) {
    const response = await this.linkedinAds.sendConversionEvent({
      conversionId: this.conversionId,
      conversionValue: this.conversionValue,
      associatedContactId: this.associatedContactId,
      timestamp: this.timestamp,
    });

    $.export("$summary", `Successfully sent conversion event with ID ${this.conversionId}`);
    return response;
  },
};
