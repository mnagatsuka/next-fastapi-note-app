#!/bin/bash

# LocalStack DynamoDB Table Initialization Script
# This script creates all required DynamoDB tables for the Next.js FastAPI Note Application
# Based on the DynamoDB repository implementations in backend/src/app/infra/repositories/

set -e

echo "🚀 Initializing DynamoDB tables in LocalStack..."

# LocalStack endpoint
LOCALSTACK_ENDPOINT="http://localhost:4566"
AWS_REGION="ap-northeast-1"

# Set fake AWS credentials for LocalStack
export AWS_ACCESS_KEY_ID="test"
export AWS_SECRET_ACCESS_KEY="test"
export AWS_DEFAULT_REGION="$AWS_REGION"

# Function to create table if it doesn't exist
create_table_if_not_exists() {
    local table_name="$1"
    local table_definition="$2"
    
    echo "📋 Checking if table '$table_name' exists..."
    
    if aws dynamodb describe-table \
        --endpoint-url "$LOCALSTACK_ENDPOINT" \
        --region "$AWS_REGION" \
        --table-name "$table_name" \
        >/dev/null 2>&1; then
        echo "✅ Table '$table_name' already exists, skipping..."
    else
        echo "🔧 Creating table '$table_name'..."
        eval "$table_definition"
        echo "✅ Table '$table_name' created successfully!"
    fi
}

# Notes Table (Public Notes)
notes_table='aws dynamodb create-table \
    --endpoint-url "$LOCALSTACK_ENDPOINT" \
    --region "$AWS_REGION" \
    --table-name "notes" \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST'


# Users Table
users_table='aws dynamodb create-table \
    --endpoint-url "$LOCALSTACK_ENDPOINT" \
    --region "$AWS_REGION" \
    --table-name "users" \
    --attribute-definitions AttributeName=uid,AttributeType=S \
    --key-schema AttributeName=uid,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST'

# WebSocket Connections Table
websocket_connections_table='aws dynamodb create-table \
    --endpoint-url "$LOCALSTACK_ENDPOINT" \
    --region "$AWS_REGION" \
    --table-name "noteapp-websocket-connections-development" \
    --attribute-definitions AttributeName=connectionId,AttributeType=S \
    --key-schema AttributeName=connectionId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST'


# Function to create GSI if it doesn't exist
create_gsi_if_not_exists() {
    local table_name="$1"
    local index_name="$2"
    local gsi_definition="$3"
    
    echo "📋 Checking if GSI '$index_name' exists on table '$table_name'..."
    
    if aws dynamodb describe-table \
        --endpoint-url "$LOCALSTACK_ENDPOINT" \
        --region "$AWS_REGION" \
        --table-name "$table_name" \
        --query "Table.GlobalSecondaryIndexes[?IndexName=='$index_name']" \
        --output text | grep -q "$index_name"; then
        echo "✅ GSI '$index_name' already exists, skipping..."
    else
        echo "🔧 Creating GSI '$index_name' on table '$table_name'..."
        eval "$gsi_definition"
        echo "✅ GSI '$index_name' created successfully!"
    fi
}

# Create all tables
create_table_if_not_exists "notes" "$notes_table"
create_table_if_not_exists "users" "$users_table"
create_table_if_not_exists "noteapp-websocket-connections-development" "$websocket_connections_table"

# Wait for notes table to be active before creating GSI
echo "⏳ Waiting for notes table to be active..."
aws dynamodb wait table-exists \
    --endpoint-url "$LOCALSTACK_ENDPOINT" \
    --region "$AWS_REGION" \
    --table-name "notes"

# Create GSI indexes for notes table
owner_index='aws dynamodb update-table \
    --endpoint-url "$LOCALSTACK_ENDPOINT" \
    --region "$AWS_REGION" \
    --table-name "notes" \
    --attribute-definitions \
        AttributeName=owner_uid,AttributeType=S \
        AttributeName=created_at,AttributeType=S \
    --global-secondary-index-updates \
        "Create={IndexName=OwnerIndex,KeySchema=[{AttributeName=owner_uid,KeyType=HASH},{AttributeName=created_at,KeyType=RANGE}],Projection={ProjectionType=ALL}}"'

public_index='aws dynamodb update-table \
    --endpoint-url "$LOCALSTACK_ENDPOINT" \
    --region "$AWS_REGION" \
    --table-name "notes" \
    --attribute-definitions \
        AttributeName=is_public,AttributeType=S \
        AttributeName=published_at,AttributeType=S \
    --global-secondary-index-updates \
        "Create={IndexName=PublicNotesIndex,KeySchema=[{AttributeName=is_public,KeyType=HASH},{AttributeName=published_at,KeyType=RANGE}],Projection={ProjectionType=ALL}}"'

create_gsi_if_not_exists "notes" "OwnerIndex" "$owner_index"
create_gsi_if_not_exists "notes" "PublicNotesIndex" "$public_index"


# List all tables for verification
echo ""
echo "📊 Listing all created tables:"
aws dynamodb list-tables \
    --endpoint-url "$LOCALSTACK_ENDPOINT" \
    --region "$AWS_REGION" \
    --output table

echo ""
echo "🎉 DynamoDB initialization completed successfully!"
echo "📍 Tables are available at: $LOCALSTACK_ENDPOINT"
echo "🔍 You can now use the DynamoDB repository provider in your backend application."
