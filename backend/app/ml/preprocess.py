import pandas as pd
import re
import string
from sklearn.model_selection import train_test_split
import os

def clean_text(text):
    text = str(text).lower()
    text = re.sub('\[.*?\]', '', text)
    text = re.sub('https?://\S+|www\.\S+', '', text)
    text = re.sub('<.*?>+', '', text)
    text = re.sub('[%s]' % re.escape(string.punctuation), '', text)
    text = re.sub('\n', ' ', text)
    text = re.sub('\w*\d\w*', '', text)
    return text

def preprocess_data(fake_path, true_path, output_dir):
    print("Loading datasets...")
    df_fake = pd.read_csv(fake_path)
    df_true = pd.read_csv(true_path)
    
    # Add labels: 0 for Fake, 1 for True
    df_fake['label'] = 0
    df_true['label'] = 1
    
    # Combine datasets
    df = pd.concat([df_fake, df_true], axis=0)
    
    print("Dropping duplicates...")
    df = df.drop_duplicates()
    
    # Combine title and text to form a unified content column
    print("Combining title and text...")
    df['content'] = df['title'] + " " + df['text']
    
    print("Cleaning text (this may take a moment)...")
    df['content'] = df['content'].apply(clean_text)
    
    # Keep only necessary columns
    df = df[['content', 'label']]
    
    print("Splitting dataset into train and test sets...")
    x = df['content']
    y = df['label']
    
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42)
    
    print("Saving processed data...")
    os.makedirs(output_dir, exist_ok=True)
    
    train_df = pd.DataFrame({'content': x_train, 'label': y_train})
    test_df = pd.DataFrame({'content': x_test, 'label': y_test})
    
    train_df.to_csv(os.path.join(output_dir, 'train.csv'), index=False)
    test_df.to_csv(os.path.join(output_dir, 'test.csv'), index=False)
    print(f"Preprocessing complete! Data saved to {output_dir}")

if __name__ == '__main__':
    # Adjust paths based on where the script is run from (backend/app/ml)
    fake_csv = "../../../fake.csv"
    true_csv = "../../../true.csv"
    out_dir = "./data"
    
    if not os.path.exists(fake_csv) or not os.path.exists(true_csv):
        print(f"Error: {fake_csv} or {true_csv} not found.")
    else:
        preprocess_data(fake_csv, true_csv, out_dir)
