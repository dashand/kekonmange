#!/bin/bash
# Purge instances inactive > 6 months
# Runs every 3 months via cron

PB_URL="http://127.0.0.1:8090"
SIX_MONTHS_AGO=$(date -u -d '6 months ago' +%Y-%m-%dT%H:%M:%SZ)

echo "$(date): Purging instances inactive since before $SIX_MONTHS_AGO"

# Get instances to purge
INSTANCES=$(curl -s "$PB_URL/api/collections/instances/records?filter=lastAccessedAt<'$SIX_MONTHS_AGO'&perPage=500")
IDS=$(echo "$INSTANCES" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for item in data.get('items', []):
    print(item['id'], item['code'], item['name'])
" 2>/dev/null)

if [ -z "$IDS" ]; then
    echo "No instances to purge."
    exit 0
fi

echo "$IDS" | while read id code name; do
    echo "Purging instance: $name ($code)"
    
    # Delete restaurants linked to this instance
    RESTS=$(curl -s "$PB_URL/api/collections/restaurants/records?filter=instance='$id'&perPage=500" | python3 -c "import sys,json; [print(i['id']) for i in json.load(sys.stdin).get('items',[])]" 2>/dev/null)
    for rid in $RESTS; do
        curl -s -X DELETE "$PB_URL/api/collections/restaurants/records/$rid" > /dev/null
    done
    
    # Delete workplaces linked to this instance
    WPS=$(curl -s "$PB_URL/api/collections/workplaces/records?filter=instance='$id'&perPage=500" | python3 -c "import sys,json; [print(i['id']) for i in json.load(sys.stdin).get('items',[])]" 2>/dev/null)
    for wid in $WPS; do
        curl -s -X DELETE "$PB_URL/api/collections/workplaces/records/$wid" > /dev/null
    done
    
    # Delete OSM cache linked to this instance (if any)
    
    # Delete the instance itself
    curl -s -X DELETE "$PB_URL/api/collections/instances/records/$id" > /dev/null
    echo "  Deleted instance $code ($name)"
done

echo "$(date): Purge complete"
