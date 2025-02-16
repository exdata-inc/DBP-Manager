from django import forms
from django.utils import timezone
from app.models import *

class DatetimeForm(forms.Form):
    # https://qiita.com/Totomone/items/c405a7fc66a1739ab7c5
    datetime = forms.DateTimeField(label='開始時刻',
        widget=forms.DateTimeInput(attrs={"type": "datetime-local", "value": timezone.datetime.now().strftime('%Y-%m-%dT%H:%M')}),
        input_formats=['%Y-%m-%dT%H:%M']
    )

class WhereForm(forms.ModelForm):
    class Meta:
        model = Where
        fields = ["place", "local", "local_x", "local_y"]
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for key in self.fields.keys():
            self.fields[key].required = False
            self.fields[key].widget = forms.Textarea(attrs={"rows": 1})
    #place = forms.CharField(label="データの取得場所", max_length=300, required=True, help_text="(例：セントレア、東山、日進市、藤沢市)")

class WhoForm(forms.ModelForm):
    class Meta:
        model = Who
        fields = ["organization", "person"]
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for key in self.fields.keys():
            self.fields[key].required = False
            self.fields[key].widget = forms.Textarea(attrs={"rows": 1})
    #organization = forms.CharField(label="データを取得した組織", max_length=300, required=True, help_text="(例：セントレア。名大、名城大、藤沢市)")
    #person = forms.CharField(label="データを取得した人", max_length=300, required=False, help_text="(例：名大太郎、コップ・セントレア)")

class WhatForm(forms.ModelForm):
    class Meta:
        model = What
        fields = ["what"]
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for key in self.fields.keys():
            self.fields[key].required = False
            self.fields[key].widget = forms.Textarea(attrs={"rows": 1})
    #what = forms.CharField(label="データの形", widget=forms.Textarea(), required=True, help_text="(例：通過数、滞留数)")

class WhyForm(forms.ModelForm):
    class Meta:
        model=Why
        fields = ["reason"]
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for key in self.fields.keys():
            self.fields[key].required = False
            self.fields[key].widget = forms.Textarea(attrs={"rows": 1})
    #reason = forms.CharField(label="データが取得された理由", widget=forms.Textarea(), required=True, help_text="どのような意図があって取得されたのか")

class HowForm(forms.ModelForm):
    class Meta:
        model = How
        fields = ["device_type", "device_model", "device_id"]
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for key in self.fields.keys():
            self.fields[key].required = False
            self.fields[key].widget = forms.Textarea(attrs={"rows": 1})
    #device_type = forms.CharField(label="データを取得したデバイスのタイプ", max_length=300, required=True, help_text="(例：赤外センサ、カメラ)")
    #device_model = forms.CharField(label="データを取得したデバイスのモデル", max_length=300, required=False, help_text="(例：RICOH THETA Z1, iPhone 13 Pro)")
    #device_id = forms.CharField(label="デバイスの固有ID", max_length=300, required=False)

class RW_adminDBForm(forms.ModelForm):
    class Meta:
        model = RW_adminDB
        fields = ["file", "when", "where", "who", "what", "why", "how"]

    def __init__(self, *args, **kwargs):
    #    author = kwargs.pop('user')
        super().__init__(*args, **kwargs)
    #    self.fields['categories'].queryset = Category.objects.filter(author=author)
    #    self.fields["when"].widget = forms.DateTimeInput(attrs={"type": "datetime-local"})
        self.fields["when"].widget = forms.DateTimeInput(attrs={"type": "datetime-local"})
        self.fields["when"].input_formats = ['%Y-%m-%dT%H:%M']
    #    self.fields["where"].name = "データの取得場所"