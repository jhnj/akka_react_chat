package controllers

import javax.inject._

import play.api.mvc._


@Singleton
class Application @Inject()(webJarAssets: WebJarAssets) extends Controller {

  def index = Action { implicit req =>
    Ok(views.html.index(webJarAssets))
  }

}
