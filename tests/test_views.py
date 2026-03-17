import pytest
from datetime import date

from django.shortcuts import reverse
from rest_framework.test import APIClient

from map.models import CommunityArea, RestaurantPermit


@pytest.fixture
def seeded_map_data():
    # Create some test community areas
    area1 = CommunityArea.objects.create(name="Beverly", area_id="1")
    area2 = CommunityArea.objects.create(name="Lincoln Park", area_id="2")

    # Test permits for Beverly
    RestaurantPermit.objects.create(
        community_area_id=area1.area_id, issue_date=date(2021, 1, 15)
    )
    RestaurantPermit.objects.create(
        community_area_id=area1.area_id, issue_date=date(2021, 2, 20)
    )

    # Test permits for Lincoln Park
    RestaurantPermit.objects.create(
        community_area_id=area2.area_id, issue_date=date(2021, 3, 10)
    )
    RestaurantPermit.objects.create(
        community_area_id=area2.area_id, issue_date=date(2021, 2, 14)
    )
    RestaurantPermit.objects.create(
        community_area_id=area2.area_id, issue_date=date(2021, 6, 22)
    )
    # Created a permit for 2020 to make sure tests are not just counting all permits
    RestaurantPermit.objects.create(
        community_area_id=area2.area_id, issue_date=date(2020, 6, 22)
    )

@pytest.mark.django_db
def test_map_data_view_returns_counts_for_selected_year(seeded_map_data):
    # Query the map data endpoint
    client = APIClient()
    response = client.get(reverse("map_data", query={"year": 2021}))

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

    parse = {item["name"]: item["num_permits"] for item in data}
    assert parse["Beverly"] == 2
    assert parse["Lincoln Park"] == 3

# created a test for a year with no data to make sure it returns 0 permits
@pytest.mark.django_db
def test_map_data_view_returns_zero_permits_for_year_with_no_data(seeded_map_data):
    client = APIClient()
    response = client.get(reverse("map_data", query={"year": 2019}))

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

    parse = {item["name"]: item["num_permits"] for item in data}
    assert parse["Beverly"] == 0
    assert parse["Lincoln Park"] == 0

    # Possible future tests: 
    # - Test that the endpoint returns all permits when no year is specified
    # - Test that the endpoint handles invalid inputs or other edge cases
