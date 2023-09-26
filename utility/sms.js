import request from "request";

export function sendSMS(phone, message) {
  request.post(
    "https://textbelt.com/text",
    {
      form: {
        phone,
        message,
        key: "textbelt",
      },
    },
    (err, httpResponse, body) => {
      console.log(JSON.parse(body));
    }
  );
}
