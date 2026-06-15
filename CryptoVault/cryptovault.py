import argparse
import hashlib

def encrypt(text, shift):

    encrypted_text = ""

    for char in text:
        if char.isalpha():
            if char.isupper():
                base = ord('A')
            else:
                base = ord('a')
            new_char = chr((ord(char)-base+shift)%26+base)
            encrypted_text += new_char
        else:
            encrypted_text += char
    return encrypted_text

def decrypt(text, shift):
    return encrypt(text, -shift)

def calculate_hash(data):
    return hashlib.sha256(data.encode("utf-8")).hexdigest()

def encrypt_file(filename, shift):
    with open(filename, "r", encoding="utf-8") as f:
        plaintext = f.read()
    file_hash = calculate_hash(plaintext)
    ciphertext = encrypt(plaintext, shift)
    output_file = filename + ".enc"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(file_hash + "\n")
        f.write(ciphertext)
    print(f"Encrypted file saved as {output_file}")

def decrypt_file(filename, shift, verify="false"):
    with open(filename, "r", encoding="utf-8") as f:
        stored_hash = f.readline().strip()
        ciphertext = f.read()
    plaintext = decrypt(ciphertext, shift)
    output_file = filename + ".dec"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(plaintext)
    print(f"Decrypted file saved as {output_file}")
    if verify:
        new_hash = calculate_hash(plaintext)

        if new_hash == stored_hash:
            print("✓ Integrity verified")
        else:
            print("⚠ WARNING: File may have been tampered with!")

parser = argparse.ArgumentParser()

parser.add_argument("action", choices=["encrypt", "decrypt"])
parser.add_argument("file")
parser.add_argument("--shift", type=int, required=True)
parser.add_argument("--verify", action="store_true")

args = parser.parse_args()

if args.action == "encrypt":
    encrypt_file(args.file, args.shift)

elif args.action == "decrypt":
    decrypt_file(args.file, args.shift, args.verify)