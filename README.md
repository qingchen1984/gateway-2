# Meccano IoT Gateway

Meccano project is a multi-purpose IoT (Internet of Things) board and software platform created by Luciano Kadoya, Rogério Biondi, Diego Osse and Talita Paschoini. Its development started in early 2014 as a closed R&D project in the Software Architecture Division, with the aim of creating a board which is robust, based on a modern microprocessor (ESP8266), cheap, easy to implement and deploy through the 750 retail stores to perform several functions, such as:
- Count the number of visitors in each store to calculate the sales/visits ratio;
- Get the vote/feedback of users regarding the services;
- Voice marketing;
- Energy saving initiatives;
- Beacons and interaction of the customer in the physical store;
- Several other undisclosed applications;

Different from other ESP8266 projects, Meccano board has been heavily tested in retail stores and adjusted to be safe against RF (radio frequency) interferences. The physical store is an inhospitable environment since there are several hundreds of electronic products, such as TVs, computers, sound and home theaters as well as electronic home appliances.

The project is still in its early stages and will evolve in the future. Magazine Luiza will plan the backlog and sponsor the project. It has been open-sourced because it´s the first initiative to create a board based on ESP8266 in Brazil and we are really excited with the possibilities. Magazine Luiza has a passion for innovations and contribution to the development of technology. So you are invited to join us because your support/collaboration is welcome!



## Configuration and Deployment



### Getting the source-code

1. Download the source code from github
2. Unzip the code into a any directory of your computer, for example /app/gateway



### Pre-requisites

For installation, you should prepare the database first. Be sure to have a MySQL or MariaDB instance database available for installation.

You need to create the ERD table model in the database. Connect to your MySQL instance and execute the following script:

```
/app/gateway/sql/schema.sql
```

The schema will create the IOTDB database as well as the relational table model.


### Configuration

Configure the config/config.yml file as follows:

```
default:
  port: 3000
  timezone: Brazil/East
  tests:
    auth: true
    statistic: true
    zero: true
  mysql:
    host: 'mysql_database_address'
    port: 3306
    user: 'user'
    password: 'pass'
    database: 'IOTDB'
    connectionLimit: 10
  statistics:
    sigmas: 6
```

You should configure the `host`, `port`, `user`, `password` `parameters`.
If you have a high concurrency, you must increase the connectionLimit accordingly.
Leave the statistics session and "sigmas" parameter as is.


### Installation / Deployment

The Meccano IoT Gateway can run on several infrastructure:

- Amazon Elastic Beanstalk
- Bare metal servers or Virtual Machines
- Docker container



#### Amazon Elastic Beanstalk

Be sure you have the MySQL database instance and config.yml ready.
Create a zip file `/app/gateway/meccano.zip` with the directory `/app/gateway`.
Deploy the zip file in to ELB service using the webconsole or command line tool (aws)
After deployment the application will be started automatically.



#### Bare metal servers or Virtual Machines

```
cd /app/gateway
npm Install
```

To start the app:

```
npm start
```



#### Docker container

Not available yet.



### Environment Configuration

For each yaml configuration parameter there is a corresponding environment variable that Meccano IoT Gateway uses to control the behaviour of the application. You may choose to use yaml, environment configuration or both.


#### General configuration

- **NODE_ENV**: name of the environment. You may set this variable according to the name of your environment, for example prod, dev, test.

Example:

```
export NODE_ENV=prod
```

And in the config.yml file you may specify different environment variables:

```
default:
  port: 8080
prod:
  port: 80
```


- **TZ**: the default value is **Brazil/East**. You should change your timezone in order gateway persists data correctly.

- **PORT**: Begin accepting connections on the specified `port.` When this variable is specified the Gateway ignore `port` write on the config  file. A port value of zero will assign a random port.

Example:

```
export PORT=8080
```

- **HOSTNAME**: Begin accepting connections on the specified `HOSTNAME`. If the hostname is omitted, the server will accept connections on any IPv6 address (`::`) when IPv6 is available, or any IPv4 address (`0.0.0.0`) otherwise.

Example:

```
export HOSTNAME=mydomain.domain
```


#### Check test configuration

- **TESTS_ZERO**: the gateway will discard zero data from devices/sensors.
This is the default behaviour of the gateway.
If you want to accept zeroes, you should define this variable to **false**.

Example:

```
export CHECK_ZERO_TEST=false
```

- **TESTS_STATISTIC**: the Meccano Service Manager evaluates the sensors and produces the statistics of each sensor in the table DeviceStatistics periodically. This verification test is useful for some industrial and retail applications. If data received deviates from the average in a significative way, the data will be considered as noise and automatically discarded by the gateway, otherwise it will be accepted and recorded on the table Facts, in the correct channel. The statistic is based on Z-Distribution (Normal) but in future releases we may include other useful such as S, T and others.
This is the default behaviour of the gateway.
If you want to skip this test, you should set the environment variable to **false**.

- **TESTS_AUTH**: this environment variable controls the authentication process. The default value é true and when set, all devices should have the mac-address previously registered/acknowledged to the gateway before sending or receiving data.


#### Database configuration

The parameters bellow control the connection and behaviour of the RDBMS.

- **MYSQL_HOST**: database hostname or ip address.

- **MYSQL_PORT**: database port.

- **MYSQL_USER**: database user.

- **MYSQL_PASSWORD**: database password.

- **MYSQL_DATABASE**: database name or instance id.

- **MYSQL_CONNECTIONLIMIT**: maximum number of connections.



#### Statistic configuration

**STATISTICS_SIGMAS**: this option will be valid only if the CHECK_STATISTIC_TEST is enabled. This controls the behaviour of the gateway regarding the deviation of data. Every information received that deviates more than the number of sigmas will be considered noise and discarded by the gateway. For six-sigma, there is a probability of 99.99966%. The default value for this parameter is 6 sigmas.




## Device Registration API

Due to security constraints, the access will be granted only to registered boards/devices.
The registration process works the following way:

1. You need to Register the device in the gateway, using the API.
2. Registration process finishes when the device access the gateway and send its acknowledgment data.
3. At any time, if you need to revoke the access to a device, you should unregister it, using the API.
4. At any time, you may check the registration status of each device.


### Registering a new Device

To register the device in the gateway:

```
curl -X POST -H "Content-Type: application/json" -d '{ "device":"99:99:99:99:99:99", "device_group": 1 }' 'http://gateway_address/api/registration'
```

- 99:99:99:99:99:99 is the mac-address/device id of the meccano board/esp8266.

- The device id is the mac-address of the Meccano Board (ESP8266).
You should choose a device_group for your device. This attribute is used to group several devices according its function, place or your decision. If you don't need to group any device, choose any number or one (1) as default;

- After the device is registered, it can contact the gateway and send data.

- Everytime your device is powered on, it will use the meccano-client library to contact the gateway and do the acknowledgment process. Meccano Iot Gateway supports automatic device acknowledgement. The only thing you need to do is to include the meccano library to your sketch and configure the server/port address.


### Getting the Device Registration information

You may check the device registration any time, calling the API:

```
curl -X GET -H "Content-Type: application/json" 'http://gateway_address/api/registration?device=99:99:99:99:99:99'
```

- 99:99:99:99:99:99 is the mac-address of the meccano board/esp8266.


### Unregistering a Device

You may unregister the device calling the API:

```
curl -X DELETE 'http://localhost:3000/api/registration?device=99:99:99:99:99:99'
```

- 99:99:99:99:99:99 is the mac-address of the meccano board/esp8266.



# Meccano APIs

Meccano IoT Gateway offers an API catalog for Registration and Messaging. In future releases there will be several others.
You may download the Postman test collection here:

https://www.getpostman.com/collections/ea7277b4935963aa0d3f



## Message API

Message API is used to send messages/commands to devices.
You may send a pre-built **REBOOT** command to Meccano board and it will restart.

You may implement your own commands. Examples:

- **BLINK**: for device blinking a led attached to a digital port;
- **BUZZ_ON** and **BUZZ_OFF**: in order to activate/deactivate a BUZZ module;
- **RELAY_ON** and **RELAY_OFF**: switching on and off an appliance or lamp;
- **ROTATE LEFT 45** : command a servo motor to rotate left 45 degrees.


### Sending messages to device

You may send a message to any device using the following command/api:

```
curl -X POST -H "Content-Type: application/json" -H "Cache-Control: no-cache" -H "Postman-Token: d9da6c25-d1d5-8546-a1ce-ff2e6647a2b6" -d '{
    "device": "18:fe:34:fd:b2:a8",
    "sender": "SYSTEM",
    "delivery_type": "TRANSIENT",
    "message": "REBOOT"
}' 'http://gateway_address/api/messages/'
```

- Device id is the mac-address of the meccano board.

- There are two delivery types of message:

1. **TRANSIENT**: that kind of message will be cleared by Meccano IoT gateway after delivery;
2. **PERSISTENT**: that kind of message will be permanent, not cleared by gateway after delivery;

- You must specify the **sender** attribute. If you don't want to detail the sender, use **SYSTEM**.

The message should be the pre-built **REBOOT** or any other custom message you want to implement on device.



### List the messages of a device

You may list all the messages of a device:

```
curl -X GET 'http://localhost:3000/api/messages/device/:device'
```

- device parameter is the mac-address, for example: 18:fe:34:fd:b2:a8



### Get the message information

It's possible to access a message, using the GET operation of the API:

```
curl -X GET 'http://localhost:3000/api/messages/:id'
```

- where id is the ID of the message you want to access to.



### Remove a message

You may remove a command/message for the device using the API:

```
curl -X DELETE 'http://localhost:3000/api/messages/:id'
```

- where id is the ID of the message you want to access to.
