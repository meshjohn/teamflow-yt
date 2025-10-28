import { createChannel, listChannels } from "./channel";
import { createWorkspace, listWorkspace } from "./workspace";

export const router = {
  workspace: {
    list: listWorkspace,
    create: createWorkspace,
  },
  channel: {
    create: createChannel,
    list: listChannels,
  },
};
