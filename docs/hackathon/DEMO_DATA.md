# Demo Data Files

## File Locations

### For Web Demo (Next.js Frontend)
```
nextjs-app/public/demo/neurolink_bom.csv
nextjs-app/public/demo/neurolink_intake.yaml
```

These are served at:
- http://localhost:3000/demo/neurolink_bom.csv
- http://localhost:3000/demo/neurolink_intake.yaml

### For CLI Demo (Python Backend)
```
python-agent/demo/neurolink_bom.csv
python-agent/demo/neurolink_intake.yaml
```

### Quick Copy Commands
```bash
# Download demo BOM from web app (if running)
curl http://localhost:3000/demo/neurolink_bom.csv -o ~/Desktop/neurolink_bom.csv

# Or copy directly
cp nextjs-app/public/demo/neurolink_bom.csv ~/Desktop/
```

---

## Demo Project: NeuroLink Mini v1.0

### Project Overview
- **Device**: Portable Brain-Computer Interface Signal Acquisition Unit
- **Purpose**: 8-channel neural signal acquisition for research
- **Class**: Medical device (FDA Class II, IEC 60601-1)
- **Quantity**: 50 prototype units
- **Budget**: $15,000

### Why This Demo?
1. **Complex enough to be impressive** - 20 line items, real medical device
2. **Shows compliance handling** - IEC 60601, FDA, ISO 13485
3. **Has critical parts** - showcases agent scrutiny
4. **Real part numbers** - DigiKey/Mouser will return actual data
5. **Relatable** - brain-computer interfaces are exciting

---

## BOM Contents (20 Line Items)

| Ref | MPN | Description | Why It's Interesting |
|-----|-----|-------------|---------------------|
| U1 | ADS1299-6PAGR | Neural ADC | **CRITICAL** - $50+ chip, no substitutes |
| U2 | STM32H743ZIT6 | ARM Cortex-M7 | High-end MCU with DSP |
| U3 | TPS7A4901DGNT | Ultra-low-noise LDO | Analog supply, noise critical |
| U4 | TPS7A8801DSGR | Ultra-low-noise LDO | Digital supply |
| U5 | INA333AIDGKR | Instrumentation Amp | **CRITICAL** - precision analog |
| U6 | ISO7741FDBQR | Digital Isolator | **CRITICAL** - patient safety |
| U7 | CP2102N-A02-GQFN24 | USB-UART Bridge | Standard part |
| U8 | W25Q128JVSIQ | 128Mbit Flash | Data storage |
| C1-C10 | GRM188R71H104KA93D | 100nF MLCC | Decoupling |
| C11-C15 | GRM21BR61E106KA73L | 10uF MLCC | Bulk caps |
| C16-C20 | T520B107M006ATE070 | 100uF Tantalum | Low ESR bulk |
| R1-R8 | RC0603FR-0710KL | 10K 1% | General purpose |
| R9-R12 | RC0603FR-07100RL | 100R 1% | Current limiting |
| R13-R16 | ERA-3AEB4991V | 4.99K 0.1% | **Precision** - critical path |
| L1 | LQH32CN100K53L | 10uH Ferrite | EMI filtering |
| J1 | 10118192-0001LF | USB-C Connector | Standard |
| J2 | M80-5101042 | Medical Header | **CRITICAL** - patient interface |
| ESD1-4 | PESD5V0S1BL | ESD Protection | Safety |
| Y1 | ECS-240-20-30B-DU | 24MHz Crystal | Clock source |
| LED1-3 | LTST-C171KGKT | Status LEDs | User feedback |

---

## Agent Analysis Highlights

### Engineering Agent Should Flag:
- U1 (ADS1299): Verify medical grade, check lifecycle
- U6 (ISO7741): Verify creepage/clearance for IEC 60601
- J2 (M80-5101042): Verify medical certification
- R13-R16: Verify 0.1% tolerance available

### Sourcing Agent Should Flag:
- U1 (ADS1299): Expensive ($50+), check lead time
- U2 (STM32H7): Check stock (sometimes constrained)
- No brokers allowed per intake

### Finance Agent Should Flag:
- Budget is $15,000 for 50 units = $300/unit max
- U1 alone is ~$50, so watch total
- Volume pricing opportunities on passives

---

## Expected Agent Decisions

### Likely Approvals:
- All Murata capacitors (preferred manufacturer)
- All Yageo resistors (preferred manufacturer)
- TI analog parts (industry standard)
- STM32H7 (explicitly required)

### Likely Scrutiny:
- ADS1299: Will approve but flag as critical/no-substitute
- Harwin connector: May suggest verification of medical cert
- Panasonic precision resistors: Should approve (preferred mfr)

### Potential Flags:
- If any part has long lead time (>21 days)
- If any part is from non-preferred distributor
- If total cost exceeds $15,000

---

## Running the Demo

### Web UI Demo
1. Start services:
   ```bash
   # Terminal 1
   cd python-agent && uv run uvicorn bom_agent_service.main:app --port 8000

   # Terminal 2
   cd nextjs-app && npm run dev
   ```

2. Open http://localhost:3000
3. Login or sign up
4. Upload `nextjs-app/public/demo/neurolink_bom.csv`
5. Watch agents process

### CLI Demo
```bash
cd python-agent

# Process with intake context
uv run sourcing process demo/neurolink_bom.csv --intake demo/neurolink_intake.yaml

# Check status
uv run sourcing status

# View agent trace
uv run sourcing trace NL-2026-001
```

---

## Talking Points During Demo

**When uploading:**
> "This is a real BOM for a medical-grade brain-computer interface. 20 components including a $50 neural ADC chip, precision analog circuitry, and medical-grade connectors."

**When agents process:**
> "Watch the Engineering agent - it's checking IEC 60601 compliance for medical devices. The ADS1299 is marked critical so it gets extra scrutiny."

**When showing results:**
> "Three strategies: cost-optimized at $12,400, speed-optimized with 7-day lead time, and consolidated to just two distributors for simpler logistics."

**On blockchain:**
> "Every decision is recorded immutably. For FDA compliance, this audit trail shows exactly when and why each sourcing decision was made."
