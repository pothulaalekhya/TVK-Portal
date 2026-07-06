@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements. See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.
@REM ----------------------------------------------------------------------------
@REM Maven Wrapper launch script for Windows
@REM Required: JAVA_HOME set or java in PATH
@REM ----------------------------------------------------------------------------

@echo off
setlocal

set MAVEN_PROJECTBASEDIR=%~dp0
set WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar"
set WRAPPER_PROPERTIES="%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.properties"

@REM If wrapper jar doesn't exist, download Maven directly
if not exist %WRAPPER_JAR% (
    echo Maven Wrapper JAR not found. Downloading Maven 3.9.6 directly...
    
    @REM Parse distribution URL from properties file
    for /F "usebackq tokens=1,2 delims==" %%A in (%WRAPPER_PROPERTIES%) do (
        if "%%A"=="distributionUrl" set DOWNLOAD_URL=%%B
    )
    
    @REM Create .mvn\wrapper directory if missing
    if not exist "%MAVEN_PROJECTBASEDIR%.mvn\wrapper" mkdir "%MAVEN_PROJECTBASEDIR%.mvn\wrapper"
    
    @REM Try PowerShell download
    powershell -Command "& { Invoke-WebRequest -Uri '%DOWNLOAD_URL%' -OutFile '%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-dist.zip' }"
    
    @REM Extract
    powershell -Command "& { Expand-Archive -Path '%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-dist.zip' -DestinationPath '%MAVEN_PROJECTBASEDIR%.mvn\wrapper' -Force }"
    
    @REM Run Maven from extracted location
    set MAVEN_CMD="%MAVEN_PROJECTBASEDIR%.mvn\wrapper\apache-maven-3.9.6\bin\mvn.cmd"
    
    if exist %MAVEN_CMD% (
        %MAVEN_CMD% %*
    ) else (
        echo ERROR: Failed to download Maven. Please install Maven manually.
        echo Download: https://maven.apache.org/download.cgi
        exit /b 1
    )
) else (
    @REM Use wrapper JAR if it exists
    java -jar %WRAPPER_JAR% %*
)
