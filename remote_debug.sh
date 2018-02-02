#!/bin/sh

# go build -gcflags='-N -l' && dlv --listen=:2345 --headless=true --api-version=2 exec ./ehoadon

go build -gcflags='-N -l' && dlv --listen=:2345 --headless=true exec ./ehoadon

#dlv debug --headless --listen=:2345 --log 