export abstract class Message {
  messageId: string;
  isOwner: boolean;
  chatRoomId: string;
  text: string;

  constructor(
    messageId: string,
    isOwner: boolean,
    chatRoomId: string,
    text: string
  ) {
    this.messageId = messageId;
    this.isOwner = isOwner;
    this.chatRoomId = chatRoomId;
    this.text = text;
  }

  toMap(): { [key: string]: any } {
    return {
      messageId: this.messageId,
      isOwner: this.isOwner ? 1 : 0,
      chatRoomId: this.chatRoomId,
      text: this.text,
    };
  }
}
