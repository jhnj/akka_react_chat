name := """akka_react_chat"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.11.8"

val akkaVersion = "2.4.2"

libraryDependencies ++= Seq(
  jdbc,
  cache,
  ws,
  "org.scalatestplus.play" %% "scalatestplus-play" % "1.5.1" % Test,
  "org.webjars" %% "webjars-play" % "2.5.0",
  "org.webjars" % "bootstrap" % "3.3.7",
  "org.postgresql" % "postgresql" % "9.4.1212",
  "org.jooq" % "jooq" % "3.9.0",
  "org.jooq" % "jooq-codegen-maven" % "3.9.0",
  "org.jooq" % "jooq-meta" % "3.9.0"
)


// include /public in dist to allow it to be referenced by nashorn
import com.typesafe.sbt.packager.MappingsHelper._
mappings in Universal ++= directory(baseDirectory.value / "public")
//fork in run := true


// sbt task for jooq code generator
val generateJOOQ = taskKey[Seq[File]]("Generate JooQ classes")

val generateJOOQTask = (sourceManaged, fullClasspath in Compile, runner in Compile, streams).map { (src, cp, r, s) =>
  toError(r.run("org.jooq.util.GenerationTool", cp.files, Array("conf/akkaChat.xml"), s.log))
  ((src / "main/generated") ** "*.scala").get
}

generateJOOQ <<= generateJOOQTask


unmanagedSourceDirectories in Compile += sourceManaged.value / "main/generated"