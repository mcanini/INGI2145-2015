Note that you do not need to have Gradle installed to run the following
commands. The gradle wrapper will automatically download the correct Gradle
version. If you do have Gradle installed and don't want to use the wrapper, use
`gradle` instead of `./gradlew`.

- To generate IntelliJ IDEA project files:

    ./gradlew idea

When opening the project in IDEA, accept to option to import the project from
Gradle when prompted. If you missed the prompt, just close and re-open IDEA.

- To generate Eclipse project files:

    ./gradlew eclipse

- To build a JAR file that can be uploaded to Amazon Elastic MapReduce:

    ./gradlew fatJar

The jar will be put under `build/libs`.

- To build and run the program with a script use:
	./run-nhop.sh

	You can open and take a look at this script if you want to change different command line arguments
	We have prepared this script with arguments since a job runner for giraph requires a significant amount of 
	arguments
