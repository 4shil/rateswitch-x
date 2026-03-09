import asyncio
from datetime import timedelta

from code_interpreter import CodeInterpreter, SupportedLanguage
from opensandbox import Sandbox
from opensandbox.models import WriteEntry

async def main() -> None:
    print("🚀 Connecting to OpenSandbox...")
    
    # 1. Create a sandbox
    sandbox = await Sandbox.create(
        "opensandbox/code-interpreter:v1.0.1",
        entrypoint=["/opt/opensandbox/code-interpreter.sh"],
        env={"PYTHON_VERSION": "3.11"},
        timeout=timedelta(minutes=10),
    )

    async with sandbox:
        print("✅ Sandbox created successfully!")
        
        # 2. Execute a shell command
        print("🔄 Running a shell command inside sandbox...")
        execution = await sandbox.commands.run("echo 'Hello OpenSandbox from Ashil!'")
        print("📝 Shell Output:", execution.logs.stdout[0].text)

        # 3. Create a code interpreter
        print("🐍 Creating Code Interpreter inside sandbox...")
        interpreter = await CodeInterpreter.create(sandbox)

        # 4. Execute Python code
        print("🚀 Executing Python code inside the isolated environment...")
        result = await interpreter.codes.run(
            """
import sys
print("Python version inside Sandbox:")
print(sys.version)
calculation = 100 * 50
calculation
            """,
            language=SupportedLanguage.PYTHON,
        )

        print("🔢 Code Result:", result.result[0].text)
        print("📋 Code Logs:", result.logs.stdout[0].text)

        # 5. Cleanup the sandbox
        await sandbox.kill()
        print("🧹 Sandbox cleaned up!")

if __name__ == "__main__":
    asyncio.run(main())
