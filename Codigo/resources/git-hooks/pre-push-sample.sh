value=`cat .git/hooks/min-coverage-reached`

if [ "$value" = "true" ] ; then
    echo "Coverage is good"
    exit 0
elif [ "$value" = "false" ] ; then
    echo "Coverage is not good"
    exit 1
else
    echo "Nothing to cover"
    exit 0
fi

exit 1