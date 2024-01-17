import formcan from "../../formcan.app.mjs";
import { axios } from "@pipedream/platform";

export default {
  key: "formcan-submit-form",
  name: "Submit Form",
  description: "Submits a user-created form in FormCan. [See the documentation](https://api.docs.formcan.com/)",
  version: "0.0.{{ts}}",
  type: "action",
  props: {
    formcan,
    formId: {
      propDefinition: [
        formcan,
        "formId",
      ],
    },
    formData: {
      propDefinition: [
        formcan,
        "formData",
        (c) => ({
          formId: c.formId,
        }),
      ],
      optional: true,
    },
  },
  async run({ $ }) {
    const response = await this.formcan.submitForm({
      formId: this.formId,
      formData: this.formData || {},
    });

    $.export("$summary", `Successfully submitted the form with ID ${this.formId}`);
    return response;
  },
};
