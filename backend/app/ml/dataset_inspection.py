import pandas as pd
import json
import os

def inspect():
    fake_path = "../../../fake.csv"
    true_path = "../../../true.csv"
    
    print("Loading datasets...")
    df_fake = pd.read_csv(fake_path)
    df_true = pd.read_csv(true_path)
    
    print("--- Fake Dataset ---")
    print(f"Filename: fake.csv")
    print(f"Format: csv")
    print(f"Number of rows: {len(df_fake)}")
    print(f"Number of columns: {len(df_fake.columns)}")
    print(f"Column names: {list(df_fake.columns)}")
    print(f"Missing values:\n{df_fake.isnull().sum()}")
    print(f"Duplicate rows: {df_fake.duplicated().sum()}")
    
    print("\n--- True Dataset ---")
    print(f"Filename: true.csv")
    print(f"Format: csv")
    print(f"Number of rows: {len(df_true)}")
    print(f"Number of columns: {len(df_true.columns)}")
    print(f"Column names: {list(df_true.columns)}")
    print(f"Missing values:\n{df_true.isnull().sum()}")
    print(f"Duplicate rows: {df_true.duplicated().sum()}")
    
    # Let's peek at the first few rows
    print("\n--- Fake Dataset Sample ---")
    print(df_fake.head(2))
    
    print("\n--- True Dataset Sample ---")
    print(df_true.head(2))

if __name__ == "__main__":
    inspect()
