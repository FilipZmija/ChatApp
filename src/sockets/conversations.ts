import { Conversation } from "../database/models/Conversation.model.js";
import { Message } from "../database/models/Message.model.js";
import { Room } from "../database/models/Room.model.js";
import { User } from "../database/models/User.model.js";
import { IConversation, TUser } from "../types/local/messaging.js";
interface ActiveRoom {
  id: number;
  name: string;
  type: string;
  active?: boolean;
  lastActive?: Date;
}

export class ConversationCard implements IConversation {
  id: number;
  childId: number;
  type: "room" | "user";
  name?: string;
  lastMessage?: Message;
  recipient: ActiveRoom;
  usersIds?: number[];
  constructor(conversation: Conversation) {
    this.id = conversation.id;
    this.type = conversation.type;
    this.recipient = { id: 0, name: "", type: "" };
    this.usersIds = conversation.users?.map((user) => user.id);
    if (conversation.messages) {
      this.lastMessage = conversation.messages[0];
    }
    if (conversation.type === "user" && conversation.users) {
      this.name = conversation.users[0].name;
      this.childId = conversation.users[0].id;
      this.recipient = conversation.users[0];
    } else {
      this.name = conversation.room.name;
      this.childId = conversation.room.id;

      const isActive =
        conversation.users?.findIndex((user) => user.active) !== -1;
      const lastActive =
        conversation.type === "room"
          ? conversation.users?.reduce((acc, curr) => {
              if (curr.lastActive && acc.lastActive) {
                if (curr.lastActive > acc.lastActive) {
                  return curr;
                } else return acc;
              } else if (acc.lastActive) {
                return acc;
              } else {
                return curr;
              }
            }).lastActive
          : undefined;
      this.recipient = {
        ...conversation.room.dataValues,
        active: isActive,
        lastActive,
      };
    }
  }
}

export const findConvesationByTwoUsers = async (ids: number[]) => {
  const user = await User.findByPk(ids[0]);
  if (user) {
    const existingConvsation = await user.getConversations({
      where: {
        "$users.id$": ids[1],
        type: "user",
      },
      include: [
        "users",
        {
          model: Message,
          limit: 30,
          order: [["createdAt", "DESC"]],
          include: [{ model: User, attributes: { exclude: ["password"] } }],
        },
      ],
    });
    if (existingConvsation[0]) {
      existingConvsation[0].messages =
        existingConvsation[0].messages?.reverse();
      return { recipient: user, conversation: existingConvsation[0] };
    } else return { recipient: user, conversation: null };
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
