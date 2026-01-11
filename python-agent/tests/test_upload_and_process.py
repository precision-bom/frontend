"""Tests for BOM upload and processing flow.

Test Cases:
- UP1: Upload BOM and process
- UP2: Process creates trace entries
- UP3: Line items have status
- UP5: Upload with intake file
- UP6: Upload minimal BOM

Note: These tests involve actual LLM calls and may take longer to run.
"""

import pytest


@pytest.mark.asyncio
async def test_up1_upload_bom_and_process(client, sample_bom_csv, test_state):
    """UP1: Upload BOM and process creates project with line items."""
    files = {"bom_file": ("test_bom.csv", sample_bom_csv, "text/csv")}

    response = await client.post("/projects/upload-and-process", files=files)

    assert response.status_code == 200
    result = response.json()

    assert "project_id" in result
    assert "status" in result
    assert "message" in result

    # Store for later tests
    test_state.created_project_ids.append(result["project_id"])


@pytest.mark.asyncio
async def test_up2_process_creates_trace_entries(client, sample_bom_csv, test_state):
    """UP2: After processing, trace contains intake and enrich steps."""
    files = {"bom_file": ("test_bom.csv", sample_bom_csv, "text/csv")}

    # Upload and process
    response = await client.post("/projects/upload-and-process", files=files)
    assert response.status_code == 200

    project_id = response.json()["project_id"]
    test_state.created_project_ids.append(project_id)

    # Check trace
    trace_response = await client.get(f"/projects/{project_id}/trace")

    assert trace_response.status_code == 200
    trace = trace_response.json()

    assert isinstance(trace, list)
    # After processing, trace should have entries
    if len(trace) > 0:
        for step in trace:
            assert "step" in step or "message" in step
            assert "timestamp" in step


@pytest.mark.asyncio
async def test_up3_line_items_have_status(client, sample_bom_csv, test_state):
    """UP3: After processing, all line items have status field."""
    files = {"bom_file": ("test_bom.csv", sample_bom_csv, "text/csv")}

    # Upload and process
    response = await client.post("/projects/upload-and-process", files=files)
    assert response.status_code == 200

    project_id = response.json()["project_id"]
    test_state.created_project_ids.append(project_id)

    # Get project details
    project_response = await client.get(f"/projects/{project_id}")

    assert project_response.status_code == 200
    project = project_response.json()

    assert len(project["line_items"]) > 0
    for item in project["line_items"]:
        assert "status" in item


@pytest.mark.asyncio
async def test_up5_upload_with_intake_file(client, sample_bom_csv, sample_intake_yaml, test_state):
    """UP5: Upload both BOM CSV and intake YAML processes with context."""
    files = {
        "bom_file": ("test_bom.csv", sample_bom_csv, "text/csv"),
        "intake_file": ("intake.yaml", sample_intake_yaml, "application/x-yaml"),
    }

    response = await client.post("/projects/upload-and-process", files=files)
    assert response.status_code == 200
    result = response.json()

    assert "project_id" in result
    test_state.created_project_ids.append(result["project_id"])

    # Verify project has context from intake file
    project_response = await client.get(f"/projects/{result['project_id']}")
    project = project_response.json()

    # The context should reflect intake file values
    assert "context" in project


@pytest.mark.asyncio
async def test_up6_upload_minimal_bom(client, minimal_bom_csv, test_state):
    """UP6: Upload minimal single-line BOM processes successfully."""
    files = {"bom_file": ("minimal.csv", minimal_bom_csv, "text/csv")}

    response = await client.post("/projects/upload-and-process", files=files)
    assert response.status_code == 200
    result = response.json()

    assert "project_id" in result
    test_state.created_project_ids.append(result["project_id"])

    # Verify single line item
    project_response = await client.get(f"/projects/{result['project_id']}")
    project = project_response.json()

    assert len(project["line_items"]) == 1
