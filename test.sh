rm -fr ma-tek-delivery/ ma-tek-delivery.zip
yarn generate:test --force-build
mv dist/ ma-tek-delivery/
zip -r ma-tek-delivery.zip ma-tek-delivery/
