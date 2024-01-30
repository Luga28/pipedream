import linkedinAds from "../../linkedin/linkedin_ads.app.mjs";
import { axios } from "@pipedream/platform";

export default {
  key: "linkedin_ads-create-audience",
  name: "Create Audience",
  description: "Creates an audience for targeting on LinkedIn Ads. [See the documentation](https://learn.microsoft.com/en-us/linkedin/marketing/matched-audiences/create-and-manage-segments?view=li-lms-2024-01&tabs=http)",
  version: "0.0.{{ts}}",
  type: "action",
  props: {
    linkedinAds,
    audienceName: {
      propDefinition: [
        linkedinAds,
        "audienceName",
      ],
    },
  },
  async run({ $ }) {
    const response = await this.linkedinAds.createAudience({
      audienceName: this.audienceName,
    });

    $.export("$summary", `Successfully created an audience with the name '${this.audienceName}'`);
    return response;
  },
};
