export const SampleSchema = {
  "tables": [
    {
      "name": "users",
      "columns": [
        { "name": "id", "type": "INT", "is_primary_key": true },
        { "name": "email", "type": "VARCHAR(255)" },
        { "name": "username", "type": "VARCHAR(100)" },
        { "name": "created_at", "type": "TIMESTAMP" },
        { "name": "role_id", "type": "INT", "foreign_key": { "table": "roles", "column": "id" } }
      ]
    },
    {
      "name": "roles",
      "columns": [
        { "name": "id", "type": "INT", "is_primary_key": true },
        { "name": "name", "type": "VARCHAR(50)" },
        { "name": "permissions", "type": "JSON" }
      ]
    },
    {
      "name": "orders",
      "columns": [
        { "name": "id", "type": "INT", "is_primary_key": true },
        { "name": "user_id", "type": "INT", "foreign_key": { "table": "users", "column": "id" } },
        { "name": "total", "type": "DECIMAL(10,2)" },
        { "name": "status", "type": "VARCHAR(50)" },
        { "name": "created_at", "type": "TIMESTAMP" }
      ]
    },
    {
      "name": "order_items",
      "columns": [
        { "name": "id", "type": "INT", "is_primary_key": true },
        { "name": "order_id", "type": "INT", "foreign_key": { "table": "orders", "column": "id" } },
        { "name": "product_id", "type": "INT", "foreign_key": { "table": "products", "column": "id" } },
        { "name": "quantity", "type": "INT" },
        { "name": "price", "type": "DECIMAL(10,2)" }
      ]
    },
    {
      "name": "products",
      "columns": [
        { "name": "id", "type": "INT", "is_primary_key": true },
        { "name": "name", "type": "VARCHAR(255)" },
        { "name": "description", "type": "TEXT" },
        { "name": "price", "type": "DECIMAL(10,2)" },
        { "name": "stock", "type": "INT" },
        { "name": "category_id", "type": "INT", "foreign_key": { "table": "categories", "column": "id" } }
      ]
    },
    {
      "name": "categories",
      "columns": [
        { "name": "id", "type": "INT", "is_primary_key": true },
        { "name": "name", "type": "VARCHAR(100)" },
        { "name": "parent_id", "type": "INT" }
      ]
    }
  ]
};

export default SampleSchema;