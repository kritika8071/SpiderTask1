#!/bin/bash

TARGET_DIR="$1"
if[ -z "$TARGET_DIR" ] then;
    echo "Usage: $0 <directory>"
    exit 1;
fi
echo "Shell scripts found:"
find "$TARGET_DIR" -type f -name "*.sh"

LOG_DIR="logs"
LOG_FILE="$LOG_DIR/vault_sweep.log"

mkdir -p "$LOG_DIR"
chmod 700 "$LOG_DIR"

log_message() {
    local level="$1"
    local message="$2"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $message" >> "$LOG_FILE"
}

scan_script() {

    local file="$1"

    if grep -q "rm -rf /" "$file"; then
        echo "[WARN] $file - Reason: Dangerous rm -rf"
        log_message "WARN" "$file contains rm -rf /"
    fi
    
    if grep -Eq '(^|[[:space:]])mkfs([[:space:]]|$)' "$file"; then
    	echo "[WARN] $file - Reason: Disk formatting command"
    	log_message "WARN" "$file contains mkfs"
    fi

    if grep -Eq 'reboot' "$file"; then
        echo "[WARN] $file - Reason: Reboot command"
        log_message "WARN" "$file contains reboot"
    fi

    if grep -Eq 'shutdown' "$file"; then
        echo "[WARN] $file - Reason: Shutdown command"
        log_message "WARN" "$file contains shutdown"
    fi

    if grep -Eq 'curl.*\|.*(sh|bash)' "$file"; then
        echo "[WARN] $file - Reason: Suspicious curl execution"
        log_message "WARN" "$file contains curl piped to shell"
    fi

    if grep -Eq 'wget.*\|.*(sh|bash)' "$file"; then
        echo "[WARN] $file - Reason: Suspicious wget execution"
        log_message "WARN" "$file contains wget piped to shell"
    fi

perm=$(stat -c "%a" "$file")
perm_string=$(stat -c "%A" "$file")

if [[ "${perm_string:8:1}" == "w" ]]
then
    echo "[WARN] $file - Reason: World writable permissions ($perm)"
    log_message "WARN" "$file contains world writable permissions ($perm)"
    read -p "Fix permissions for $file? (yes/no): " answer < /dev/tty

    if [[ "$answer" == "yes" ]]
    then
        chmod o-w "$file"
        echo "[FIX] $file permissions updated"
        log_message "FIX" "$file removed world write permission"
    fi

fi
}

sanitize_env() {

    local file="$1"
    local output="${file}.sanitized"
    local valid=0
    local invalid=0
    > "$output"

    echo "Created: $output"

    while IFS= read -r line
    do
        [[ -z "$line" ]] && continue
        if [[ "$line" =~ ^[A-Z_][A-Z0-9_]*=[^[:space:]]+$ ]]
        then
            echo "VALID FORMAT"

            local key="${line%%=*}"
            local value="${line#*=}"

    if [[ "$key" =~ (PASSWORD|SECRET|TOKEN|PATH) ]]
    then
        echo "REJECTED SECRET: $key"
        log_message "SKIP" "$file Rejected: $line"
        ((invalid++))

        continue
    fi

    if [[ "$value" =~ ^\".*\"$ ]]
    then
        echo "REJECTED QUOTED VALUE"
        log_message "SKIP" "$file Rejected: $line"
        ((invalid++))

        continue
    fi

echo "$line" >> "$output"

((valid++))

            echo "KEY=$key VALUE=$value"

        else
            echo "INVALID FORMAT"
            log_message "SKIP" "$file Rejected: $line"
            ((invalid++))
        fi
        echo "valid=$valid invalid=$invalid"
    done < "$file"

echo "Valid: $valid"
echo "Invalid: $invalid"
log_message "INFO" "$file Valid: $valid, Invalid: $invalid"
}

while IFS= read -r envfile
do
    sanitize_env "$envfile"
done < <(find "$TARGET_DIR" -type f -name ".env*" ! -name "*.sanitized")

while IFS= read -r file
do
    scan_script "$file"
done < <(find "$TARGET_DIR" -type f -name "*.sh")
