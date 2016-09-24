# Sample Build Commands

    ./gradlew
    
    ./gradlew run
    
    ./gradlew && ./gradlew npm_run_serve_dist
    
    nvm install 6.5.0
    npm run run

# Deploy Commands

    cd ~/github/mrduguo/rubix && rm -rf docs && cp -r demo/dist docs && cp -r demo/public-production/* docs/ && git checkout HEAD docs/CNAME && git add -A docs && git commit -m "updated site" && git push
    
    