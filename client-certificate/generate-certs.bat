REM Create CA certificate, self sign and of course test:
openssl genrsa -des3 -out ca.key 2048
openssl req -new -x509 -days 365 -key ca.key -config openssl.cfg -out ca.crt
openssl x509 -in ca.crt -text -noout

REM Create server certificate, request signing, sign with our CA and test:
openssl genrsa -out server.key 1024
openssl req -new -key server.key -config openssl.cfg -out server.csr
openssl x509 -req -in server.csr -out server.crt -CA ca.crt -CAkey ca.key -CAcreateserial -days 365
openssl x509 -in server.crt -text -noout

REM Create userA certificate, request signing, sign with our CA and test:
openssl genrsa -out userA.key 1024
openssl req -new -key userA.key -config openssl.cfg -out userA.csr
openssl x509 -req -in userA.csr -out userA.crt -CA ca.crt -CAkey ca.key -CAcreateserial -days 365
openssl x509 -in userA.crt -text -noout

REM Do same thing for one more user:
openssl genrsa -out userB.key 1024
openssl req -new -key userB.key -config openssl.cfg -out userB.csr
openssl x509 -req -in userB.csr -out userB.crt -CA ca.crt -CAkey ca.key -CAcreateserial -days 365
openssl x509 -in userB.crt -text -noout

REM Clean up:
del *.csr
mkdir keys
mkdir certs
mkdir ca
copy ca.* ca
copy *.key keys
copy *.crt certs
del ca.*
del *.key
del *.crt

REM If we want to use browser instead of nodeJS client for connection to server certificates must be transferred to p12 format ( p12 contains both key and certificate )
openssl pkcs12 -export -in certs/userA.crt -inkey keys/userA.key -name "User A BusyWait test cert" -out userA.p12
open userA.p12

