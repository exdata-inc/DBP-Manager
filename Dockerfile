FROM python:3.12
ENV PYTHONUNBUFFERED 1

USER root

RUN apt-get update && \
    apt-get -y install locales vim less && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
RUN localedef -f UTF-8 -i ja_JP ja_JP.UTF-8
ENV LANG ja_JP.UTF-8
ENV LANGUAGE ja_JP:ja
ENV LC_ALL ja_JP.UTF-8
ENV TZ JST-9
ENV TERM xterm

RUN pip install --no-cache-dir --upgrade pip setuptools wheel

COPY requirements.txt /root/scripts/
RUN python -m pip install --no-cache-dir -r /root/scripts/requirements.txt

COPY run.sh /root/scripts/
COPY clean.sh /root/scripts/
COPY server/manage.py /root/scripts/server/
COPY server/consts.py /root/scripts/server/
COPY server/accounts/ /root/scripts/server/accounts/
COPY server/app/ /root/scripts/server/app/
COPY server/config/ /root/scripts/server/config/
# COPY /.ssh /root/.ssh # copy your ssh key to move your data
# RUN chmod 600 /root/.ssh/* # change your ssh key permission

WORKDIR /root/scripts

CMD [ "/root/scripts/run.sh" ]
