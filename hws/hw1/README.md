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

    ./gradlew assemble

The jar will be put under `build/libs`.

- To run the program without command line arguments:

    ./gradlew run

- To run the program with command line arguments:

    ./run.sh <arg1> <arg2> <arg3> ...

- Some sample test configurations are provided in the test_configurations file

- A sample graph input file is provided as well, please take a look at test_inputs folder
