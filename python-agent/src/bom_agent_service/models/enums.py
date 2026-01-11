"""Enums for BOM processing."""

from enum import Enum


class DecisionStatus(str, Enum):
    """Status of an agent decision."""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    ESCALATED = "escalated"


class RiskLevel(str, Enum):
    """Risk level assessment."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class SupplierType(str, Enum):
    """Type of supplier."""
    AUTHORIZED = "authorized"
    BROKER = "broker"
    DIRECT = "direct"


class TrustLevel(str, Enum):
    """Trust level for suppliers."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class LifecycleStatus(str, Enum):
    """Part lifecycle status."""
    ACTIVE = "active"
    NRND = "nrnd"      # Not Recommended for New Designs
    EOL = "eol"        # End of Life
    OBSOLETE = "obsolete"


class LineItemStatus(str, Enum):
    """Processing status of a BOM line item."""
    PENDING_ENRICHMENT = "pending_enrichment"
    ENRICHED = "enriched"
    PENDING_ENGINEERING = "pending_engineering"
    PENDING_SOURCING = "pending_sourcing"
    PENDING_FINANCE = "pending_finance"
    PENDING_FINAL_DECISION = "pending_final_decision"
    PENDING_PURCHASE = "pending_purchase"
    ORDERED = "ordered"
    RECEIVED = "received"
    FAILED = "failed"


class ProductType(str, Enum):
    """Product type classification."""
    CONSUMER = "consumer"
    INDUSTRIAL = "industrial"
    MEDICAL = "medical"
    AUTOMOTIVE = "automotive"
    AEROSPACE = "aerospace"
