import test from "node:test";
import assert from "node:assert/strict";
import { gym } from "@/config/gym";
import { getContactInbox, getStaffInviteAddress } from "@/lib/email";

function withEnv(values, run) {
  const previous = {};
  for (const key of Object.keys(values)) {
    previous[key] = process.env[key];
    if (values[key] === undefined) delete process.env[key];
    else process.env[key] = values[key];
  }
  try {
    return run();
  } finally {
    for (const key of Object.keys(values)) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
}

test("gym config exposes two distinct business addresses and no ambiguous `email`", () => {
  assert.equal("email" in gym, false);
  assert.match(gym.contactEmail, /^[^@\s]+@[^@\s]+\.[^@\s]+$/);
  assert.match(gym.staffInviteEmail, /^[^@\s]+@[^@\s]+\.[^@\s]+$/);
  assert.notEqual(gym.contactEmail, gym.staffInviteEmail);
});

test("contact inbox: config default, CONTACT_INBOX_EMAIL override, never the invite address", () => {
  withEnv({ CONTACT_INBOX_EMAIL: undefined, STAFF_INVITE_EMAIL: "invites@example.org" }, () => {
    assert.equal(getContactInbox(), gym.contactEmail);
    assert.notEqual(getContactInbox(), "invites@example.org");
  });
  withEnv({ CONTACT_INBOX_EMAIL: "desk@example.org" }, () => {
    assert.equal(getContactInbox(), "desk@example.org");
  });
});

test("staff invitation address: config default, STAFF_INVITE_EMAIL override, never the contact inbox", () => {
  withEnv({ STAFF_INVITE_EMAIL: undefined, CONTACT_INBOX_EMAIL: "desk@example.org" }, () => {
    assert.equal(getStaffInviteAddress(), gym.staffInviteEmail);
    assert.notEqual(getStaffInviteAddress(), "desk@example.org");
  });
  withEnv({ STAFF_INVITE_EMAIL: "invites@example.org" }, () => {
    assert.equal(getStaffInviteAddress(), "invites@example.org");
  });
});
