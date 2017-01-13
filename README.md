# Akka React Chat

Simple chat app built using React.js, Scala Play and Akka Actors. 
You can try it out at [Akka React Chat](http://ec2-54-93-90-85.eu-central-1.compute.amazonaws.com/)

React bundling and transpiling is done using webpack and serverside pre-rendering is done 
using [Nashorn](http://openjdk.java.net/projects/nashorn/)

### Setup
To run the the play application you need 
[Lightbend Activator](http://www.lightbend.com/community/core-tools/activator-and-sbt).

When you have activator installed do `$ activator run` and the application will be started listening on port 9000.

### ToDo
* Store the messages in a database to view old messages
* Add some kind of login and authentication
