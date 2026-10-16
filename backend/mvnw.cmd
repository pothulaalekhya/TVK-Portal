@REM ----------------------------------------------------------------------------
@REM Maven Wrapper launch script for Windows
@REM ----------------------------------------------------------------------------
@echo off
setlocal

set "MAVEN_PROJECTBASEDIR=%~dp0"
set "WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar"

if exist "%WRAPPER_JAR%" (
    java -Dmaven.multiModuleProjectDirectory="%MAVEN_PROJECTBASEDIR%." -cp "%WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*
    exit /b %ERRORLEVEL%
)

echo Maven Wrapper JAR not found: %WRAPPER_JAR%
exit /b 1

