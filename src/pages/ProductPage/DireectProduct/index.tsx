import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip, CardMedia } from '@mui/material';
import { Visibility, Star, ShoppingCart } from '@mui/icons-material';

interface ProductProps {
    sellerNickname: string;
    productName: string;
    productDescription: string;
    productPrice: number;
    productImage: string;
    productCategory: string;
    productStatus: 'available' | 'sold_out' | 'discontinued';
    viewCount: number;
    reviewCount: number;
    totalSales: number;
}

const DirectProduct: React.FC = () => {
    // 這裡可以添加實際的 API 呼叫來獲取商品資料
    const product: ProductProps = {
        sellerNickname: "賣家名稱",
        productName: "商品名稱",
        productDescription: "這是商品的詳細描述...",
        productPrice: 1000,
        productImage: "https://via.placeholder.com/400",
        productCategory: "電子產品",
        productStatus: "available",
        viewCount: 1500,
        reviewCount: 25,
        totalSales: 100
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return 'success';
            case 'sold_out':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
            <Grid container spacing={4}>
                {/* 商品圖片 */}
                <Grid item xs={12} md={6}>
                    <CardMedia
                        component="img"
                        height="400"
                        image={product.productImage}
                        alt={product.productName}
                        sx={{ borderRadius: 2, objectFit: 'cover' }}
                    />
                </Grid>

                {/* 商品資訊 */}
                <Grid item xs={12} md={6}>
                    <Card elevation={0} sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                賣家：{product.sellerNickname}
                            </Typography>

                            <Typography variant="h4" component="h1" gutterBottom>
                                {product.productName}
                            </Typography>

                            <Box sx={{ my: 2 }}>
                                <Chip
                                    label={product.productCategory}
                                    color="primary"
                                    size="small"
                                    sx={{ mr: 1 }}
                                />
                                <Chip
                                    label={product.productStatus === 'available' ? '商品供應中' : '已售完'}
                                    color={getStatusColor(product.productStatus) as any}
                                    size="small"
                                />
                            </Box>

                            <Typography variant="h5" color="primary" gutterBottom>
                                NT$ {product.productPrice.toLocaleString()}
                            </Typography>

                            <Typography variant="body1" paragraph sx={{ my: 3 }}>
                                {product.productDescription}
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 3, my: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Visibility color="action" />
                                    <Typography variant="body2" color="text.secondary">
                                        {product.viewCount} 次瀏覽
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Star color="action" />
                                    <Typography variant="body2" color="text.secondary">
                                        {product.reviewCount} 則評價
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ShoppingCart color="action" />
                                    <Typography variant="body2" color="text.secondary">
                                        已售出 {product.totalSales} 件
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DirectProduct;