from rest_framework import serializers
from django.db.models import IntegerField
from django.db.models.functions import Cast

from map.models import CommunityArea, RestaurantPermit

# Maybe more efficient way to annotate permits with single db query in other files, currently O(n)
# Could consider migrating schema to avoid repeated casting
class CommunityAreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityArea
        # area_id would make frontend joins easier, but I am not sure the live sources provide it reliably.
        fields = ["name", "num_permits"]

    num_permits = serializers.SerializerMethodField()

    def get_num_permits(self, obj):
        year = self.context.get("year")
        if not year or obj.area_id is None:
            return 0
        try:
            year = int(year)
        except (TypeError, ValueError):
            return 0

        return RestaurantPermit.objects.filter(
            community_area_id__regex=r"^\d+$",
            issue_date__year=year,
        ).annotate(
            community_area_id_int=Cast("community_area_id", IntegerField())
        ).filter(
            community_area_id_int=obj.area_id
        ).count()
