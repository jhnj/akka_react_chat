package actors

import play.api.libs.json.{JsValue, Json, Reads, Writes}

/**
  * Created by johan on 26/12/16.
  */
case class Message(channel: String, user: String, message: String)

object Message {
  implicit val messageWrites: Writes[Message] = new Writes[Message]{
    def writes(message: Message): JsValue= {
      Json.obj(
        "channel" -> message.channel,
        "user" -> message.user,
        "message" -> message.message
      )
    }
  }

  implicit val messageReads: Reads[Message] = Json.reads[Message]


}