"""Seed demo data for NeuroLink Mini BOM processing demo."""

from datetime import date, datetime
from .models import SupplierKnowledge, PartKnowledge, SupplierType, TrustLevel
from .stores import OrgKnowledgeStore


def seed_demo_data(store: OrgKnowledgeStore) -> dict:
    """
    Seed the knowledge store with realistic demo data for the NeuroLink Mini project.
    Returns a summary of what was seeded.
    """
    stats = {"suppliers": 0, "parts": 0}

    # =========================================================================
    # Supplier Knowledge
    # =========================================================================

    suppliers = [
        SupplierKnowledge(
            supplier_id="digikey",
            name="Digi-Key",
            supplier_type=SupplierType.AUTHORIZED,
            trust_level=TrustLevel.HIGH,
            on_time_rate=0.97,
            quality_rate=0.995,
            lead_time_accuracy=0.92,
            account_rep="Jennifer Walsh",
            account_rep_email="jwalsh@digikey.com",
            payment_terms="Net 30",
            credit_limit=50000.0,
            notes=[
                "[procurement 2024-06-15] Excellent support for medical device customers - dedicated compliance team",
                "[engineering 2024-09-20] Fast response on technical queries, good datasheets",
                "[finance 2024-11-01] Approved for volume discounts on orders >$10K",
            ],
            last_order_date=date(2025, 1, 5),
            total_spend_ytd=12500.0,
            order_count_ytd=8,
        ),
        SupplierKnowledge(
            supplier_id="mouser",
            name="Mouser",
            supplier_type=SupplierType.AUTHORIZED,
            trust_level=TrustLevel.HIGH,
            on_time_rate=0.94,
            quality_rate=0.99,
            lead_time_accuracy=0.88,
            account_rep="Michael Torres",
            account_rep_email="mtorres@mouser.com",
            payment_terms="Net 30",
            credit_limit=35000.0,
            notes=[
                "[procurement 2024-08-10] Good backup supplier for hard-to-find passives",
                "[engineering 2024-10-15] Strong inventory of TI and STMicro parts",
                "[logistics 2024-12-01] Shipping from Texas - 2-3 day delivery typical",
            ],
            last_order_date=date(2025, 1, 2),
            total_spend_ytd=8200.0,
            order_count_ytd=5,
        ),
        SupplierKnowledge(
            supplier_id="newark",
            name="Newark",
            supplier_type=SupplierType.AUTHORIZED,
            trust_level=TrustLevel.HIGH,
            on_time_rate=0.91,
            quality_rate=0.98,
            lead_time_accuracy=0.85,
            account_rep="Sarah Johnson",
            account_rep_email="sjohnson@newark.com",
            payment_terms="Net 45",
            credit_limit=25000.0,
            notes=[
                "[procurement 2024-05-20] Good for Amphenol and TE connectors",
                "[quality 2024-07-15] Had one issue with counterfeit capacitors in 2023 - resolved, now require COC",
                "[finance 2024-09-01] Longer payment terms available for medical projects",
            ],
            last_order_date=date(2024, 12, 15),
            total_spend_ytd=4500.0,
            order_count_ytd=3,
        ),
        SupplierKnowledge(
            supplier_id="arrow",
            name="Arrow Electronics",
            supplier_type=SupplierType.AUTHORIZED,
            trust_level=TrustLevel.MEDIUM,
            on_time_rate=0.89,
            quality_rate=0.97,
            lead_time_accuracy=0.82,
            account_rep="David Chen",
            account_rep_email="dchen@arrow.com",
            payment_terms="Net 30",
            credit_limit=20000.0,
            notes=[
                "[procurement 2024-04-10] Slower response times than DigiKey/Mouser",
                "[engineering 2024-06-20] Good for Microchip/Atmel parts",
                "[quality 2024-08-15] Requires longer lead times for full traceability docs",
            ],
            last_order_date=date(2024, 11, 20),
            total_spend_ytd=2100.0,
            order_count_ytd=2,
        ),
    ]

    for supplier in suppliers:
        existing = store.get_supplier(supplier.supplier_id)
        if not existing or not existing.notes:
            # Update if new or missing notes (upgrade from earlier seed)
            store._save_supplier(supplier)
            stats["suppliers"] += 1

    # =========================================================================
    # Part Knowledge - Parts from the sample BOM
    # =========================================================================

    parts = [
        # Yageo Resistor - commonly used
        PartKnowledge(
            mpn="RC0805FR-0710KL",
            notes=[
                "[engineering 2024-03-15] Standard precision resistor, works well in voltage dividers",
                "[quality 2024-08-20] Zero failures across 10K+ units deployed",
            ],
            approved_alternates=["ERJ-6ENF1002V", "CRCW080510K0FKEA"],
            preferred=True,
            last_used_date=date(2024, 12, 1),
            projects_used_in=["NL-2024-001", "NL-2024-003", "PROTO-2024-005"],
            times_used=15,
            failure_count=0,
        ),
        # Panasonic Electrolytic Cap
        PartKnowledge(
            mpn="ECA-1EM101",
            notes=[
                "[engineering 2024-06-10] Good for bulk decoupling, ESR acceptable for our application",
                "[quality 2024-09-15] One batch had slightly elevated ESR - monitor supplier lots",
            ],
            approved_alternates=["UVR1E101MDD1TD"],
            last_used_date=date(2024, 11, 15),
            projects_used_in=["NL-2024-002", "PROTO-2024-004"],
            times_used=8,
            failure_count=1,
            quality_notes=["2024-09 - 1 unit failed infant mortality test, replaced batch"],
        ),
        # ATmega328P - Legacy part
        PartKnowledge(
            mpn="ATMEGA328P-PU",
            notes=[
                "[engineering 2024-01-20] Legacy MCU - still useful for simple control tasks",
                "[engineering 2024-07-15] Consider migrating to STM32G0 for new designs",
                "[procurement 2024-10-01] Stock has been erratic post-pandemic",
            ],
            approved_alternates=["ATMEGA328PB-AU"],
            last_used_date=date(2024, 10, 1),
            projects_used_in=["LEGACY-2023-001", "PROTO-2024-002"],
            times_used=5,
            failure_count=0,
        ),
        # Samsung MLCC
        PartKnowledge(
            mpn="CL21B104KBCNNNC",
            notes=[
                "[engineering 2024-04-05] Standard 0.1uF decoupling cap, C0G preferred for analog but X7R OK for digital",
                "[procurement 2024-08-20] Samsung MLCCs have been reliable, good pricing in volume",
            ],
            approved_alternates=["GRM21BR71H104KA01L", "C0805C104K5RACTU"],
            preferred=True,
            last_used_date=date(2024, 12, 10),
            projects_used_in=["NL-2024-001", "NL-2024-002", "NL-2024-003", "PROTO-2024-005"],
            times_used=25,
            failure_count=0,
        ),
        # LM7805 Voltage Regulator
        PartKnowledge(
            mpn="LM7805CT",
            notes=[
                "[engineering 2024-02-15] Classic linear regulator - use LDO for noise-sensitive analog circuits",
                "[engineering 2024-05-20] Requires heatsink above 500mA load, check thermal design",
                "[quality 2024-09-01] Robust part, no field failures",
            ],
            approved_alternates=["L7805CV", "MC7805BDTRKG"],
            last_used_date=date(2024, 9, 1),
            projects_used_in=["LEGACY-2022-003", "PROTO-2024-001"],
            times_used=12,
            failure_count=0,
        ),
        # USB-C Connector
        PartKnowledge(
            mpn="12401610E4#2A",
            notes=[
                "[engineering 2024-06-25] Amphenol USB-C, good mechanical durability",
                "[quality 2024-08-10] Passed 10K insertion cycle testing",
                "[manufacturing 2024-10-15] Requires specific reflow profile - see assembly notes",
            ],
            approved_alternates=[],  # No alternates - mechanical fit specific
            last_used_date=date(2024, 11, 1),
            projects_used_in=["NL-2024-002", "NL-2024-003"],
            times_used=6,
            failure_count=0,
        ),
        # 2N2222A Transistor
        PartKnowledge(
            mpn="2N2222A",
            notes=[
                "[engineering 2024-03-01] Workhorse NPN, use for switching loads up to 500mA",
                "[engineering 2024-07-10] For new designs consider MMBT2222A (SMD version)",
            ],
            approved_alternates=["PN2222A", "MMBT2222A"],
            last_used_date=date(2024, 8, 15),
            projects_used_in=["LEGACY-2023-002", "PROTO-2024-003"],
            times_used=10,
            failure_count=0,
        ),
        # 1N4007 Rectifier
        PartKnowledge(
            mpn="1N4007-E3/54",
            notes=[
                "[engineering 2024-04-20] Standard rectifier, 1A rating suitable for most power input stages",
                "[procurement 2024-06-15] Vishay version preferred for traceability",
            ],
            approved_alternates=["1N4007-T", "S1M"],
            last_used_date=date(2024, 10, 20),
            projects_used_in=["NL-2024-001", "PROTO-2024-004"],
            times_used=8,
            failure_count=0,
        ),
    ]

    for part in parts:
        existing = store.get_part(part.mpn)
        if not existing:
            store._save_part(part)
            stats["parts"] += 1

    # =========================================================================
    # Banned Parts (from intake file)
    # =========================================================================

    banned_parts = [
        ("ADS1298", "Only 8 channels, need ADS1299 for full 8-ch differential input"),
        ("STM32F4", "Insufficient processing power for real-time DSP requirements"),
    ]

    for mpn, reason in banned_parts:
        existing = store.get_part(mpn)
        if not existing:
            part = PartKnowledge(
                mpn=mpn,
                banned=True,
                ban_reason=reason,
                notes=[f"[engineering 2024-01-15] BANNED: {reason}"],
            )
            store._save_part(part)
            stats["parts"] += 1

    return stats


def main():
    """Run the seeding script."""
    print("Seeding demo data for NeuroLink Mini project...")
    store = OrgKnowledgeStore()
    stats = seed_demo_data(store)
    print(f"Seeded {stats['suppliers']} suppliers and {stats['parts']} parts")
    print("\nSuppliers in knowledge base:")
    for s in store.list_suppliers():
        print(f"  - {s.name} ({s.supplier_id}): {s.trust_level.value} trust, {len(s.notes)} notes")
    print("\nParts in knowledge base:")
    for p in store.list_parts():
        status = "BANNED" if p.banned else ("preferred" if p.preferred else "")
        print(f"  - {p.mpn}: {status} used {p.times_used}x, {len(p.notes)} notes")


if __name__ == "__main__":
    main()
