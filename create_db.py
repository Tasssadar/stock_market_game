#!/usr/bin/env python3
import os
import csv
import sqlite3
import argparse
import sys
import time

def parse_args():
    parser = argparse.ArgumentParser(description="Create SQLite database from stock market datasets.")
    parser.add_argument(
        "-d", "--db-path",
        default="stock_market.db",
        help="Path to the output SQLite database file (default: stock_market.db)"
    )
    parser.add_argument(
        "-t", "--tickers-csv",
        default="datasets/akcie_hra_tickers_cz.csv",
        help="Path to the CSV file containing tickers (default: datasets/akcie_hra_tickers_cz.csv)"
    )
    parser.add_argument(
        "-s", "--stocks-dir",
        default="datasets/stocks",
        help="Path to the directory containing stock price history CSVs (default: datasets/stocks)"
    )
    return parser.parse_args()

def safe_float(val):
    if not val or val.strip() == "":
        return None
    try:
        return float(val)
    except ValueError:
        return None

def safe_int(val):
    if not val or val.strip() == "":
        return None
    try:
        return int(val)
    except ValueError:
        return None

def create_db(db_path, tickers_csv_path, stocks_dir):
    start_time = time.time()
    
    print(f"Creating/opening database at: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    # Drop existing tables to ensure clean, reproducible state
    print("Dropping existing tables (if any)...")
    cursor.execute("DROP TABLE IF EXISTS prices;")
    cursor.execute("DROP TABLE IF EXISTS tickers;")
    
    # Create tickers table
    # Ticker contains CSV contents as is, two columns with text, ticker is unique key (PRIMARY KEY)
    print("Creating table: tickers")
    cursor.execute("""
        CREATE TABLE tickers (
            ticker TEXT PRIMARY KEY,
            popis TEXT
        );
    """)
    
    # Create prices table
    print("Creating table: prices")
    cursor.execute("""
        CREATE TABLE prices (
            ticker TEXT,
            date TEXT,
            open REAL,
            high REAL,
            low REAL,
            close REAL,
            adj_close REAL,
            volume INTEGER,
            FOREIGN KEY (ticker) REFERENCES tickers (ticker)
        );
    """)
    conn.commit()
    
    # Load tickers
    print(f"Reading tickers from {tickers_csv_path}...")
    if not os.path.exists(tickers_csv_path):
        print(f"Error: Tickers CSV file '{tickers_csv_path}' not found.", file=sys.stderr)
        conn.close()
        sys.exit(1)
        
    tickers = []
    with open(tickers_csv_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        try:
            header = next(reader)
            # Expecting columns like Ticker, Popis
        except StopIteration:
            print("Error: Tickers CSV is empty.", file=sys.stderr)
            conn.close()
            sys.exit(1)
            
        for row in reader:
            if len(row) >= 2:
                ticker = row[0].strip()
                popis = row[1].strip()
                if ticker:
                    tickers.append((ticker, popis))
                    
    print(f"Inserting {len(tickers)} tickers into table 'tickers'...")
    cursor.executemany("INSERT INTO tickers (ticker, popis) VALUES (?, ?);", tickers)
    conn.commit()
    
    # Load prices for the tickers only
    total_prices_inserted = 0
    
    for ticker, _ in tickers:
        stock_csv_path = os.path.join(stocks_dir, f"{ticker}.csv")
        if not os.path.exists(stock_csv_path):
            print(f"Warning: Price history CSV for ticker '{ticker}' not found at '{stock_csv_path}'. Skipping.")
            continue
            
        print(f"Loading prices for {ticker} from {stock_csv_path}...")
        
        price_records = []
        with open(stock_csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Expected columns: Date,Open,High,Low,Close,Adj Close,Volume
                date_val = row.get('Date', '').strip()
                open_val = safe_float(row.get('Open'))
                high_val = safe_float(row.get('High'))
                low_val = safe_float(row.get('Low'))
                close_val = safe_float(row.get('Close'))
                adj_close_val = safe_float(row.get('Adj Close'))
                volume_val = safe_int(row.get('Volume'))
                
                if date_val:
                    price_records.append((
                        ticker,
                        date_val,
                        open_val,
                        high_val,
                        low_val,
                        close_val,
                        adj_close_val,
                        volume_val
                    ))
        
        if price_records:
            cursor.executemany("""
                INSERT INTO prices (ticker, date, open, high, low, close, adj_close, volume)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            """, price_records)
            total_prices_inserted += len(price_records)
            
    print(f"Committed {total_prices_inserted} price records.")
    conn.commit()
    
    # Create indices
    # "In prices, add index on the ticker and on date"
    print("Creating indices on table 'prices' for 'ticker' and 'date' columns...")
    cursor.execute("CREATE INDEX idx_prices_ticker ON prices(ticker);")
    cursor.execute("CREATE INDEX idx_prices_date ON prices(date);")
    conn.commit()
    
    # Close connection
    conn.close()
    
    elapsed = time.time() - start_time
    print(f"Database creation complete! Saved to {db_path} in {elapsed:.2f} seconds.")
    print(f"Summary: {len(tickers)} tickers, {total_prices_inserted} price history rows.")

if __name__ == "__main__":
    args = parse_args()
    create_db(args.db_path, args.tickers_csv, args.stocks_dir)
