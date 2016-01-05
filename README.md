# Meccano IoT Gateway

Meccano project is a multi-purpose IoT (Internet of Things) board and software platform created by Luciano Kadoya, Rogério Biondi, Diego Osse and Talita Paschoini. Its development started in early 2014 as a closed R&D project in the Software Architecture Division, with the aim of creating a board which is robust, based on a modern microprocessor (ESP8266), cheap, easy to implement and deploy through the 750 retail stores to perform several functions, such as:
- Count the number of visitors in each store to calculate the sales/visits ratio;
- Get the vote/feedback of users regarding the services;
- Voice marketing;
- Energy saving initiatives;
- Beacons and interaction of the customer in the physical store;
- Several other undisclosed applications;

Different from other ESP8266 projects, Meccano board has been heavily tested in retail stores and adjusted to be safe against RF (radio frequency) interferences. The physical store is an inhospitable environment since there are several hundreds of electronic products, such as TVs, computers, sound and home theaters as well as electronic home appliances.

The project is still in its early stages and will evolve in the future. Magazine Luiza is planning the backlog and sponsoring the project. It has been open-sourced because it´s the first initiative to create a board based on ESP8266 in Brazil and we are really excited with the possibilities. Magazine Luiza has a passion for innovations and contribution to the development of technology. So you are invited to join us because your support/collaboration is welcome! .



## Configuration and Deployment



### Getting the source-code

1. Download the source code from github
2. Unzip the code into a any directory of your computer, for example /app/gateway



### Pre-requisites

For installation, you should prepare the database first. Be sure to have a MySQL or MariaDB instance database available for installation.

You need to create the ERD table model in the database. Connect to your MySQL instance and execute the following script:

/app/gateway/sql/schema.sql

The schema will create the IOTDB database as well as the relational table model.



### configuration

Configure the config/config.yml file as follows:

> default:
>  port: 80
>  mysql:
>    host: 'host_name'
>    port: 3306
>    user: 'user'
>    password: 'password'
>    database: 'IOTDB'
>    connectionLimit: 10
>  statistics:
>    sigmas: 6

You should configure the host, port, user, password parameters.
If you have a high concurrency, you must increase the connectionLimit accordingly.
Leave the statistics session and "sigmas" parameter as is.



### Installation / Deployment

The Meccano IoT Gateway can run on several infrastructure:

- Amazon Elastic Beanstalk
- Bare metal servers or Virtual Machines
- Docker container



#### Amazon Elastic Beanstalk

Be sure you have the MySQL database instance and config.yml ready.
Create a zip file /app/gateway/meccano.zip with the directory /app/gateway.
Deploy the zip file in to ELB service using the webconsole or command line tool (aws)
After deployment the application will be started automatically.



#### Bare metal servers or Virtual Machines

`
cd /app/gateway
npm Install
`

To start the app:

`npm start`



#### Docker container

Not available yet.



### Configuration

Meccano IoT Gateway has some environment variables that control the behaviour of the application

**NODE_ENV**: name of the environment. You may set this variable according to the name of your environment, for example prod, dev, test.

Example:

`export NODE_ENV=prod`

And in the config.yml file you may specify different environment variables:


> default:
>  port: 8080
> prod:
>  port: 80


**CHECK_ZERO_TEST**: the gateway will discard zero data from devices/sensors.
This is the default behaviour of the gateway.
If you want to accept zeroes, you should define this variable to **false**.

Example:

`export CHECK_ZERO_TEST=false`

**CHECK_STATISTIC_TEST**: the Meccano Service Manager evaluates the sensors and produces the statistics of each sensor in the table DeviceStatistics periodically. If the information received deviates from the average in a significative way, the data will be considered as noise and automatically discarded by the gateway, otherwise it will be accepted and recorded on the table Facts, in the correct channel.
This is the default behaviour of the gateway.
If you want to skip this test, you should set the environment variable to **false**.


## Device Registration

Due to security constraints, the access will be denied to non-registered boards/devices.
You need to register the device in the gateway:

`
curl -X POST -H "Content-Type: application/json" -d '{ "device":"99:99:99:99:99:99", "device_group": 1 }' 'http://gateway_address/api/registration'
`

- 99:99:99:99:99:99 is the mac-address/device id of the meccano board/esp8266.

- The device id is the mac-address of the Meccano Board (ESP8266).
You should choose a device_group for your device. This attribute is used to group several devices according its function, place or your decision. If you don't need to group any device, choose any number or one (1) as default;

- After the device is registered, it can contact the gateway and send data.

- Everytime your device is powered on, it will use the meccano-client library to contact the gateway and do the acknowledgment process. Meccano Iot Gateway supports automatic device acknowledgement. The only thing you need to do is to include the meccano library to your sketch and configure the server/port address.


## Device Registration information

You may check the device registration any time, calling the API:

`curl -X GET -H "Content-Type: application/json" 'http://gateway_address/api/registration?device=99:99:99:99:99:99'`

- 99:99:99:99:99:99 is the mac-address of the meccano board/esp8266.
