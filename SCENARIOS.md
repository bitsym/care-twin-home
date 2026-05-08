# SCENARIOS.md

# Scenario definitions

## Scenario 1: Normal morning routine

Purpose:
Show normal daily behaviour without false alarm.

Event sequence:
1. 07:10 bed pressure unoccupied
2. 07:11 bedroom presence active
3. 07:13 hallway presence active
4. 07:15 bathroom presence active
5. 07:25 kitchen presence active
6. 07:28 kettle smart plug active
7. 07:40 medication box opened

Expected risk:
- Remains below 30.
- No family alert.

## Scenario 2: Night bathroom prolonged stay

Purpose:
Main product-demo risk event.

Event sequence:
1. 02:10 bed pressure occupied
2. 02:13 bed pressure unoccupied
3. 02:14 hallway presence active
4. 02:15 bathroom door open
5. 02:15 bathroom presence active
6. 02:30 bathroom presence still active
7. 02:45 bathroom presence still active, no bed return

Expected risk:
- Starts normal.
- Rises to Attention after prolonged stay.
- Rises to High Risk after 30 minutes.
- Triggers night light, voice prompt, family alert.

## Scenario 3: Long static inactivity

Purpose:
Detect possible inactivity risk without making medical claims.

Event sequence:
1. 14:00 living room presence active
2. 14:30 living room presence active
3. 15:00 living room presence active
4. 15:30 living room presence active, no movement pattern change

Expected risk:
- Rises from Normal to Warning.
- Triggers voice check and family attention message.

## Scenario 4: Missed medication

Purpose:
Show medication support.

Event sequence:
1. 08:00 scheduled medication time
2. 08:15 medication box not opened
3. 08:30 medication box still not opened

Expected risk:
- Attention level.
- Voice reminder first.
- Family notification if still missed.

## Scenario 5: Kitchen gas/smoke risk

Purpose:
Show environmental safety.

Event sequence:
1. 18:20 kitchen presence inactive
2. 18:21 gas sensor abnormal
3. 18:22 smoke sensor normal
4. 18:23 gas sensor still abnormal

Expected risk:
- High Risk.
- Trigger kitchen safety alert.
- Simulate gas shutoff.
- Send family alert.
