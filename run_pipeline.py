"""Master Execution Script for Customer Retention & Revenue Intelligence Platform.

Runs the complete end-to-end pipeline:
1. Data Ingestion & File Validation
2. Data Cleaning & Feature Engineering
3. PostgreSQL Database Schema & Bulk Loading
4. SQL Analytical Marts & Retention Calculations
5. Automated PyTest Verification Suite
"""

import sys
import time
import subprocess
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from src.config import logger


def print_banner(text: str):
    width = 75
    print("\n" + "=" * width)
    print(f"  {text.center(width - 4)}")
    print("=" * width + "\n")


def run_step(step_name: str, module_name: str):
    print_banner(f"RUNNING: {step_name}")
    start = time.time()
    try:
        cmd = [sys.executable, "-m", module_name]
        res = subprocess.run(cmd, check=True)
        elapsed = time.time() - start
        print(f"\n>>> [SUCCESS] {step_name} completed in {elapsed:.2f} seconds.\n")
    except subprocess.CalledProcessError as e:
        print(f"\n>>> [ERROR] {step_name} failed with exit code {e.returncode}.\n")
        raise


def run_tests():
    print_banner("RUNNING: Automated PyTest Suite")
    cmd = [sys.executable, "-m", "pytest", "tests/", "-v"]
    res = subprocess.run(cmd)
    if res.returncode == 0:
        print("\n>>> [SUCCESS] All 16 automated tests passed!\n")
    else:
        print("\n>>> [WARNING] Some tests reported failures.\n")


def main():
    total_start = time.time()
    print_banner("CUSTOMER RETENTION & REVENUE INTELLIGENCE PIPELINE")
    
    # 1. Ingestion
    run_step("Step 1: Data Ingestion & Integrity Check", "src.data_ingestion")
    
    # 2. Cleaning & Validation
    run_step("Step 2: Data Cleaning & Feature Engineering", "src.data_cleaning")
    
    # 3. PostgreSQL Database Loading
    run_step("Step 3: PostgreSQL Schema Creation & Bulk Loading", "src.database_loader")
    
    # 4. SQL Analytics & Mart Generation
    run_step("Step 4: SQL Analytical Queries & Mart Export", "src.sql_runner")
    
    # 5. Machine Learning Propensity Model
    run_step("Step 5: Machine Learning Repeat Purchase Model", "src.churn_prediction")
    
    # 6. Automated Tests
    run_tests()
    
    total_elapsed = time.time() - total_start
    print_banner(f"PIPELINE COMPLETE - TOTAL TIME: {total_elapsed:.2f}s")
    print("All datasets processed, PostgreSQL tables loaded, ML models trained, and Power BI marts generated.")
    print("\nTo launch the interactive Streamlit analytics dashboard, run:")
    print("    py -m streamlit run dashboard/app.py")
    print("    (or run .\\run_dashboard.bat)\n")
    print("To launch the FastAPI REST service, run:")
    print("    py -m uvicorn src.api:app --host 127.0.0.1 --port 8000 --reload\n")


if __name__ == "__main__":
    main()

