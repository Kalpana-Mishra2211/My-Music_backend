import { sendEmail } from "./sendEmail.js";

export const sendArtistApprovalEmail = async (artist, type) => {
  let subject = "";
  let html = "";

  if (type === "initial") {
    subject = "🎵 Artist Account Approved";

    html = `
      <h2>Congratulations ${artist.userName} 🎉</h2>
      <p>Your artist account has been <b>approved for the first time</b>.</p>
      <p>You can now upload songs and albums 🚀</p>
      <br/>
      <p>Welcome to the platform ❤️</p>
      <p>– My Music Team</p>
    `;
  }

  if (type === "update") {
    subject = "🎵 Artist Profile Update Approved";

    html = `
      <h2>Hello ${artist.userName} 🎉</h2>
      <p>Your <b>profile update has been approved</b> by admin.</p>
      <p>Your new changes are now live 🚀</p>
      <br/>
      <p>– My Music Team</p>
    `;
  }

  await sendEmail(artist.email, subject, html);
};


export const sendArtistRejectionEmail = async (artist, type, reason) => {
  const isUpdate = type === "update";

  const subject = isUpdate
    ? "❌ Profile Update Rejected"
    : "❌ Artist Application Rejected";

  const html = isUpdate
    ? `
      <h2>Hi ${artist.userName}</h2>
      <p>Your <b>profile update request</b> has been rejected by admin.</p>

      <p><b>Reason:</b> ${reason}</p>

      <p>Please review your changes and submit again.</p>

      <br/>
      <p>– My Music Team</p>
    `
    : `
      <h2>Hi ${artist.userName}</h2>
      <p>We’re sorry, your <b>artist application</b> has been rejected.</p>

      <p><b>Reason:</b> ${reason}</p>

      <p>You can improve your profile and re-apply anytime.</p>

      <br/>
      <p>– My Music Team</p>
    `;

  await sendEmail(artist.email, subject, html);
};