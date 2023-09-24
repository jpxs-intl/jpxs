import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import cuid from "cuid";

@Entity()
export class Poll<hasMessage = false> {
  @PrimaryKey()
  id: string = cuid();

  @Property({
    type: "text",
  })
  text: string;

  @Property({
    type: "json",
  })
  options: {
    [key: string]: string[];
  };

  @Property({
    nullable: true,
  })
  message!: hasMessage extends true ? string : undefined;

  @Property({
    nullable: true,
  })
  channel!: hasMessage extends true ? string : undefined;

  @Property()
  createdAt: Date = new Date();

  constructor(text: string, options: string[]) {
    this.text = text;
    this.options = {};

    options.forEach((option) => {
      this.options[option] = [];
    });
  }

  addVote(option: string, userId: string) {
    this.removeVote(userId);
    if (!this.options[option]) {
      this.options[option] = [userId];
    } else {
      this.options[option].push(userId);
    }
  }

  removeVote(userId: string) {
    Object.keys(this.options).forEach((option) => {
      this.options[option] = this.options[option].filter((id) => id !== userId);
    });
  }

  setMessage(channelId: string, messageId: string): Poll<true> {
    this.channel = channelId as any;
    this.message = messageId as any;
    return this as Poll<true>;
  }
}
