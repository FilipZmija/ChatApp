import { Conversation } from "../database/models/Conversation.model.js";
import { Message } from "../database/models/Message.model.js";
import { User } from "../database/models/User.model.js";
import { IConversation, TUser } from "../types/local/messaging.js";

export class ConversationNote implements IConversation {
  id: number;
  childId: number;
  type: "room" | "user";
  name?: string;
  lastMessage?: Message;
  constructor(conversation: Conversation) {
    this.id = conversation.id;
    this.type = conversation.type;

    if (conversation.messages) {
      this.lastMessage = conversation.messages[0];
    }

    if (conversation.type === "user" && conversation.users) {
      this.name = conversation.users[0].name;
      this.childId = conversation.users[0].id;
    } else {
      this.name = conversation.room.name;
      this.childId = conversation.room.id;
    }
  }
}

export const findConvesationByTwoUsers = async (ids: number[]) => {
  const user = await User.findByPk(ids[0]);
  if (user) {
    const existingConvsation = await user.getConversations({
      where: {
        "$users.id$": ids[1],
      },
      include: ["users", "messages"],
    });
    if (existingConvsation[0])
      return { recipient: user, conversation: existingConvsation[0] };
    else return { recipient: user, conversation: null };
  }
};

export const startConversation = async (
  recipeint: IConversation,
  user: TUser
): Promise<{ recipient: User; conversation: Conversation } | string> => {
  const { type, childId } = recipeint;
  const { id } = user;
  try {
    const existingConvsation = await findConvesationByTwoUsers([id, childId]);
    if (existingConvsation) {
      if (existingConvsation.conversation) return existingConvsation;
      const conversation = await Conversation.create({ type });
      if (childId) {
        await conversation.addUsers([id, childId]);
        return { recipient: existingConvsation.recipient, conversation };
      } else return "Something went wrong";
    } else return "Something went wrong";
  } catch (e) {
    console.error(e);
    return "Something went wrong";
  }
};
