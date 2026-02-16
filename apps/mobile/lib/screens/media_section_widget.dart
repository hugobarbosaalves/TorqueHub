/// Widget de galeria de mídias para uma ordem de serviço.
///
/// Exibe as fotos associadas à ordem em um carrossel horizontal,
/// permite adicionar novas fotos via câmera/galeria e excluir existentes.
library;

import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../services/api_service.dart';
import '../theme/app_tokens.dart';
import '../widgets/tq_snackbar.dart';
import '../widgets/tq_confirm_dialog.dart';

/// Galeria de fotos/vídeos vinculada a uma ordem de serviço.
class MediaSectionWidget extends StatefulWidget {
  /// ID da ordem de serviço cujas mídias serão exibidas.
  final String serviceOrderId;

  /// Lista inicial de mídias já carregadas.
  final List<Map<String, dynamic>> initialMedia;

  /// Status atual da ordem — bloqueia edição quando COMPLETED/CANCELLED.
  final String orderStatus;

  const MediaSectionWidget({
    super.key,
    required this.serviceOrderId,
    required this.initialMedia,
    this.orderStatus = 'DRAFT',
  });

  @override
  State<MediaSectionWidget> createState() => _MediaSectionWidgetState();
}

class _MediaSectionWidgetState extends State<MediaSectionWidget> {
  late List<Map<String, dynamic>> _media;
  bool _uploading = false;
  final _picker = ImagePicker();

  /// Retorna true se a ordem está em status final (sem edição).
  bool get _isLocked =>
      widget.orderStatus == 'COMPLETED' || widget.orderStatus == 'CANCELLED';

  @override
  void initState() {
    super.initState();
    _media = List.from(widget.initialMedia);
  }

  @override
  void didUpdateWidget(covariant MediaSectionWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialMedia != widget.initialMedia) {
      _media = List.from(widget.initialMedia);
    }
  }

  /// Abre seletor para escolher câmera ou galeria e faz upload.
  Future<void> _pickAndUploadMedia() async {
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      builder: (ctx) => SafeArea(
        child: Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Câmera'),
              onTap: () => Navigator.pop(ctx, ImageSource.camera),
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Galeria'),
              onTap: () => Navigator.pop(ctx, ImageSource.gallery),
            ),
          ],
        ),
      ),
    );
    if (source == null) return;

    final picked = await _picker.pickImage(source: source, imageQuality: 80);
    if (picked == null) return;

    setState(() => _uploading = true);
    try {
      await ApiService.uploadMedia(widget.serviceOrderId, File(picked.path));
      final media = await ApiService.getMedia(widget.serviceOrderId);
      if (!mounted) return;
      setState(() {
        _media = media;
        _uploading = false;
      });
      showSuccessSnack(context, 'Foto enviada com sucesso!');
    } catch (e) {
      if (!mounted) return;
      setState(() => _uploading = false);
      showErrorSnack(context, 'Erro no upload: $e');
    }
  }

  /// Exclui uma mídia com confirmação.
  Future<void> _deleteMedia(String mediaId) async {
    final confirmed = await showConfirmDialog(
      context,
      title: 'Excluir Foto',
      content: 'Deseja remover esta foto?',
    );
    if (!confirmed) return;

    try {
      await ApiService.deleteMedia(widget.serviceOrderId, mediaId);
      final media = await ApiService.getMedia(widget.serviceOrderId);
      if (!mounted) return;
      setState(() => _media = media);
      showSuccessSnack(context, 'Foto removida');
    } catch (e) {
      if (!mounted) return;
      showErrorSnack(context, 'Erro: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Fotos / Mídias',
              style: TextStyle(
                fontSize: TqTokens.fontSizeLg,
                fontWeight: TqTokens.fontWeightSemibold,
              ),
            ),
            _uploading
                ? const SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : _isLocked
                ? const SizedBox.shrink()
                : IconButton(
                    icon: const Icon(Icons.add_a_photo, color: TqTokens.accent),
                    onPressed: _pickAndUploadMedia,
                    tooltip: 'Adicionar foto',
                  ),
          ],
        ),
        const SizedBox(height: TqTokens.space4),
        if (_media.isEmpty) _buildEmptyState() else _buildGallery(),
      ],
    );
  }

  Widget _buildEmptyState() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: TqTokens.space12),
      decoration: BoxDecoration(
        color: TqTokens.neutral50,
        borderRadius: BorderRadius.circular(TqTokens.radiusMd),
        border: Border.all(color: TqTokens.neutral200),
      ),
      child: const Column(
        children: [
          Icon(
            Icons.photo_library_outlined,
            size: 40,
            color: TqTokens.neutral400,
          ),
          SizedBox(height: TqTokens.space4),
          Text(
            'Nenhuma foto adicionada',
            style: TextStyle(
              color: TqTokens.neutral500,
              fontSize: TqTokens.fontSizeSm,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGallery() {
    return SizedBox(
      height: 120,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: _media.length,
        separatorBuilder: (_, _) => const SizedBox(width: TqTokens.space4),
        itemBuilder: (context, index) {
          final item = _media[index];
          final url = '${ApiService.baseUrl}${item['url']}';
          return _buildMediaThumbnail(item, url);
        },
      ),
    );
  }

  Widget _buildMediaThumbnail(Map<String, dynamic> item, String url) {
    return GestureDetector(
      onLongPress: _isLocked ? null : () => _deleteMedia(item['id'] as String),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(TqTokens.radiusMd),
        child: Stack(
          children: [
            Image.network(
              url,
              width: 120,
              height: 120,
              fit: BoxFit.cover,
              errorBuilder: (_, _, _) => Container(
                width: 120,
                height: 120,
                color: TqTokens.neutral200,
                child: const Icon(
                  Icons.broken_image,
                  color: TqTokens.neutral400,
                ),
              ),
            ),
            if (!_isLocked)
              Positioned(
                top: TqTokens.space2,
                right: TqTokens.space2,
                child: Container(
                  padding: const EdgeInsets.all(TqTokens.space1),
                  decoration: BoxDecoration(
                    color: TqTokens.neutral900.withAlpha(140),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.close,
                    size: 14,
                    color: TqTokens.card,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
