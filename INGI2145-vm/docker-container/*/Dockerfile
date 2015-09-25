FROM ubuntu
MAINTAINER Muhammad Bilal "mbilal_ce@live.com"

RUN apt-get -y update
RUN apt-get -y install ruby
RUN gem install --no-ri --no-rdoc puppet
RUN apt-get -y install wget
RUN mkdir /puppet
WORKDIR /puppet
ADD base.pp /puppet/base.pp

RUN puppet apply base.pp
RUN /bin/bash -c "source /root/.bashrc"
WORKDIR /root/
