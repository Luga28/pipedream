import { axios } from "@pipedream/platform";

export default {
  type: "app",
  app: "formcan",
  propDefinitions: {
    formId: {
      type: "string",
      label: "Form ID",
      description: "The ID of the form to submit to or retrieve fields from.",
      required: true,
    },
    formData: {
      type: "object",
      label: "Form Data",
      description: "The data to fill in the form. If not provided, a blank form will be submitted.",
      optional: true,
    },
    submissionTime: {
      type: "string",
      label: "Submission Time",
      description: "The time the form was submitted. Optional.",
      optional: true,
    },
  },
  methods: {
    _baseUrl() {
      return "https://api.formcan.com/v4";
    },
    async _makeRequest(opts = {}) {
      const {
        $ = this, method = "GET", path, headers, ...otherOpts
      } = opts;
      return axios($, {
        ...otherOpts,
        method,
        url: this._baseUrl() + path,
        headers: {
          ...headers,
          Authorization: `Bearer ${this.$auth.oauth_access_token}`,
        },
      });
    },
    async submitForm({
      formId, formData,
    }) {
      const payload = {
        submit_data: formData || {},
      };
      return this._makeRequest({
        method: "POST",
        path: `/submit/form/${formId}/`,
        data: payload,
      });
    },
    async getFormFields({ formId }) {
      return this._makeRequest({
        path: `/form/${formId}/fields`,
      });
    },
    authKeys() {
      console.log(Object.keys(this.$auth));
    },
  },
  version: "0.0.{{ts}}",
};
