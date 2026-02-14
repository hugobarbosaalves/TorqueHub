/// Widget de galeria de mídias para uma ordem de serviço.
///
/// Exibe as fotos associadas à ordem em um carrossel horizontal,
/// permite adicionar novas fotos via câmera/galeria e excluir existentes.
library;

import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../services/api_service.dart';

/// Galeria de fotos/vídeos vinculada a uma ordem de serviço.
class MediaSectionWidget extends StatefulWidget {
  /// ID da ordem de serviço cujas mídias serão exibidas.
  final String serviceOrderId;

  /// Lista inicial de mídias já carregadas.
  final List<Map<String, dynamic>> initialMedia;

  const MediaSectionWidget({
    super.key,
    required this.serviceOrderId,
    required this.initialMedia,
  });

  @override
  State<MediaSectionWidget> createState() => _MediaSectionWidgetState();
}

class _MediaSectionWidgetState extends State<MediaSectionWidget> {
  late List<Map<String, dynamic>> _media;
  bool _uploading = false;
  final _picker = ImagePicker();

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
      await ApiService.uploadMedia(
        widget.serviceOrderId,
        File(picked.path),
      );
      final media = await ApiService.getMedia(widget.serviceOrderId);
      if (!mounted) return;
      setState(() {
        _media = media;
        _uploading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Foto enviada com sucesso!'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _uploading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erro no upload: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  /// Exclui uma mídia com confirmação.
  Future<void> _deleteMedia(String mediaId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Excluir Foto'),
        content: const Text('Deseja remover esta foto?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Não'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Sim', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    try {
      await ApiService.deleteMedia(widget.serviceOrderId, mediaId);
      final media = await ApiService.getMedia(widget.serviceOrderId);
      if (!mounted) return;
      setState(() => _media = media);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Foto removida'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro: $e'), backgroundColor: Colors.red),
      );
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
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            _uploading
                ? const SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : IconButton(
                    icon: const Icon(Icons.add_a_photo, color: Colors.blue),
                    onPressed: _pickAndUploadMedia,
                    tooltip: 'Adicionar foto',
                  ),
          ],
        ),
        const SizedBox(height: 8),
        if (_media.isEmpty) _buildEmptyState() else _buildGallery(),
      ],
    );
  }

  Widget _buildEmptyState() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 24),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        children: [
          Icon(
            Icons.photo_library_outlined,
            size: 40,
            color: Colors.grey.shade400,
          ),
          const SizedBox(height: 8),
          Text(
            'Nenhuma foto adicionada',
            style: TextStyle(color: Colors.grey.shade500, fontSize: 13),
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
        separatorBuilder: (_, _a) => const SizedBox(width: 8),
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
      onLongPress: () => _deleteMedia(item['id'] as String),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: Stack(
          children: [
            Image.network(
              url,
              width: 120,
              height: 120,
              fit: BoxFit.cover,
              errorBuilder: (_, _a, _b) => Container(
                width: 120,
                height: 120,
                color: Colors.grey.shade200,
                child: const Icon(Icons.broken_image),
              ),
            ),
            Positioned(
              top: 4,
              right: 4,
              child: GestureDetector(
                onTap: () => _deleteMedia(item['id'] as String),
                child: Container(
                  padding: const EdgeInsets.all(2),
                  decoration: const BoxDecoration(
                    color: Colors.black54,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.close,
                    size: 16,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
